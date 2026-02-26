import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as common from 'oci-common';
import * as streaming from 'oci-streaming';

type AuthMode = 'instance_principal' | 'config_file';

export interface StreamRef {
  streamId: string;
  name?: string;
}

export interface ConsumeOpts extends StreamRef {
  partition?: string;
  limit?: number;
  timeoutMs?: number;
  cursor?: string;
  cursorType?: 'LATEST' | 'TRIM_HORIZON' | 'AT_CURSOR';
}

interface CursorResponseShape {
  cursor?: { value?: string };
  value?: string;
  data?: { value?: string };
}

interface MessagesResponseShape {
  messages?: unknown[];
  getMessages?: { messages?: unknown[] };
  data?: { messages?: unknown[]; opcNextCursor?: string };
  opcNextCursor?: string;
  nextCursor?: string;
}

function hasErrorMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

@Injectable()
export class OciStreamingService implements OnModuleInit {
  private static client: streaming.StreamClient | null = null;
  private readonly logger = new Logger(OciStreamingService.name);
  private readonly authMode: AuthMode;
  private readonly region: string;
  private readonly endpoint: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;

  constructor(private readonly config: ConfigService) {
    this.authMode = (this.config.get<string>('OCI_AUTH_MODE') ??
      'instance_principal') as AuthMode;
    this.region = this.config.get<string>('OCI_REGION') ?? '';
    this.endpoint = this.config.get<string>('OCI_STREAMING_ENDPOINT') ?? '';
    this.maxRetries = Number(
      this.config.get<string>('OCI_STREAM_MAX_RETRIES') ?? 3,
    );
    this.retryBaseMs = Number(
      this.config.get<string>('OCI_STREAM_RETRY_BASE_MS') ?? 200,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.init();
  }

  private async init(): Promise<void> {
    if (!this.endpoint) throw new Error('OCI_STREAMING_ENDPOINT is required.');
    if (!this.region) throw new Error('OCI_REGION is required.');

    if (!OciStreamingService.client) {
      const provider = await this.buildAuthProvider();
      const client = new streaming.StreamClient({
        authenticationDetailsProvider: provider,
      });
      client.endpoint = this.endpoint;
      OciStreamingService.client = client;
    }
    this.logger.log('OCIStreaming initialized');
  }

  private async buildAuthProvider(): Promise<common.AuthenticationDetailsProvider> {
    if (this.authMode === 'instance_principal') {
      return new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
    }
    const filePath =
      this.config.get<string>('OCI_CONFIG_FILE_PATH') ?? '~/.oci/config';
    const profile = this.config.get<string>('OCI_CONFIG_PROFILE') ?? 'DEFAULT';
    return new common.ConfigFileAuthenticationDetailsProvider(
      filePath,
      profile,
    );
  }

  private getClient(): streaming.StreamClient {
    if (!OciStreamingService.client)
      throw new Error('OCI Streaming client not initialized.');
    return OciStreamingService.client;
  }

  private async withRetries<T>(
    fn: () => Promise<T>,
    label: string,
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
        lastErr = err;
        const isLast = attempt === this.maxRetries;
        const msg = hasErrorMessage(err) ? err.message : String(err);
        this.logger.error(
          `[OCIStreaming] ${label} failed (attempt ${attempt + 1}/${this.maxRetries + 1}): ${String(
            msg,
          )}`,
        );
        if (isLast) break;
        await new Promise((r) =>
          setTimeout(r, this.retryBaseMs * Math.pow(2, attempt)),
        );
      }
    }
    throw lastErr;
  }

  private metaLabel(meta: StreamRef) {
    return `streamId=${meta.streamId}${meta.name ? ` name=${meta.name}` : ''}`;
  }

  async createCursor(meta: ConsumeOpts) {
    const client = this.getClient();
    const cursorType = meta.cursor
      ? 'AT_CURSOR'
      : (meta.cursorType ?? 'LATEST');

    return this.withRetries(
      async () => {
        const req: streaming.requests.CreateCursorRequest = {
          streamId: meta.streamId,
          createCursorDetails: {
            type: cursorType,
            cursor: meta.cursor,
            partition: meta.partition,
          },
        };
        const raw = (await client.createCursor(req)) as unknown;
        const resp = raw as CursorResponseShape;

        const cursor = resp?.cursor?.value ?? resp?.value ?? resp?.data?.value;
        return cursor as string;
      },
      `createCursor(${this.metaLabel(meta)})`,
    );
  }

  async getRecords(
    meta: StreamRef & { cursor: string; limit?: number; timeoutMs?: number },
  ) {
    const client = this.getClient();
    const limit = meta.limit ?? 100;

    return this.withRetries(
      async () => {
        const req: streaming.requests.GetMessagesRequest = {
          streamId: meta.streamId,
          cursor: meta.cursor,
          limit,
        };
        const raw = (await client.getMessages(req)) as unknown;
        const resp = raw as MessagesResponseShape;

        const messages =
          resp?.messages ??
          resp?.getMessages?.messages ??
          resp?.data?.messages ??
          [];
        const nextCursor =
          resp?.opcNextCursor ?? resp?.nextCursor ?? resp?.data?.opcNextCursor;

        return { messages, nextCursor } as {
          messages: unknown[];
          nextCursor?: string;
        };
      },
      `getMessages(${this.metaLabel(meta)})`,
    );
  }

  async consume(
    opts: ConsumeOpts,
    onMessages: (
      msgs: unknown[],
      ctx: { nextCursor?: string; commit: () => Promise<void> },
    ) => Promise<void>,
  ) {
    let cursor = opts.cursor ?? (await this.createCursor(opts));
    let nextCursor: string | undefined;

    while (true) {
      const { messages, nextCursor: nc } = await this.getRecords({
        ...opts,
        cursor,
        limit: opts.limit,
      });
      nextCursor = nc;

      if (!messages.length) {
        await new Promise((r) => setTimeout(r, 100));
        cursor = nextCursor ?? cursor;
        continue;
      }

      await onMessages(messages, {
        nextCursor,
        commit: () => {
          if (nextCursor) cursor = nextCursor;
          return Promise.resolve();
        },
      });

      if (nextCursor) cursor = nextCursor;
    }
  }
}
