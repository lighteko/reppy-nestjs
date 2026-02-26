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
  pollIntervalMs?: number;
  timeoutMs?: number;
  cursor?: string;
  cursorType?: streaming.models.CreateCursorDetails.Type;
  offset?: number;
  time?: Date;
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
  private stopRequested = false;
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
    const cursorType =
      meta.cursorType ?? streaming.models.CreateCursorDetails.Type.Latest;

    if (!meta.partition) {
      throw new Error('createCursor: partition is required');
    }
    const partition = meta.partition;

    if (
      (cursorType === streaming.models.CreateCursorDetails.Type.AtOffset ||
        cursorType === streaming.models.CreateCursorDetails.Type.AfterOffset) &&
      meta.offset === undefined
    ) {
      throw new Error(
        'createCursor: offset is required for offset cursor types',
      );
    }

    if (
      cursorType === streaming.models.CreateCursorDetails.Type.AtTime &&
      !meta.time
    ) {
      throw new Error('createCursor: time is required for AT_TIME cursor type');
    }

    return this.withRetries(
      async () => {
        const req: streaming.requests.CreateCursorRequest = {
          streamId: meta.streamId,
          createCursorDetails: {
            type: cursorType,
            partition,
            ...(meta.offset !== undefined ? { offset: meta.offset } : {}),
            ...(meta.time ? { time: meta.time } : {}),
          },
        };
        const resp = await client.createCursor(req);

        if (!resp.cursor?.value) {
          throw new Error('createCursor: missing cursor value');
        }
        return resp.cursor.value;
      },
      `createCursor(${this.metaLabel(meta)})`,
    );
  }

  async getRecords(meta: StreamRef & { cursor: string; limit?: number }) {
    const client = this.getClient();
    const limit = meta.limit ?? 100;

    return this.withRetries(
      async () => {
        const req: streaming.requests.GetMessagesRequest = {
          streamId: meta.streamId,
          cursor: meta.cursor,
          limit,
        };
        const resp = await client.getMessages(req);
        const messages = resp.items ?? [];
        const nextCursor = resp.opcNextCursor;

        return { messages, nextCursor } as {
          messages: streaming.models.Message[];
          nextCursor?: string;
        };
      },
      `getMessages(${this.metaLabel(meta)})`,
    );
  }

  async consume(
    opts: ConsumeOpts,
    onMessages: (
      msgs: streaming.models.Message[],
      ctx: { nextCursor?: string; commit: () => Promise<void> },
    ) => Promise<void>,
  ) {
    let cursor = opts.cursor ?? (await this.createCursor(opts));
    let nextCursor: string | undefined;
    const pollIntervalMs = opts.pollIntervalMs ?? opts.timeoutMs ?? 100;

    while (!this.stopRequested) {
      const { messages, nextCursor: nc } = await this.getRecords({
        ...opts,
        cursor,
        limit: opts.limit,
      });
      nextCursor = nc;

      if (!messages.length) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
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

    throw new Error('consume loop stopped unexpectedly');
  }
}
