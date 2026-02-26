import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as common from 'oci-common';
import * as queue from 'oci-queue';

type AuthMode = 'instance_principal' | 'config_file';

export interface PutMessageInput {
  content: string;
}

export interface QueueRef {
  queueId: string;
  channel?: string;
  name?: string;
}

export type PutOpts = QueueRef;

export interface GetOpts extends QueueRef {
  limit?: number;
  timeoutInSeconds?: number;
  visibilityInSeconds?: number;
}

export type DeleteOpts = QueueRef;

function hasErrorMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

@Injectable()
export class OciQueuesService implements OnModuleInit {
  private static client: queue.QueueClient | null = null;
  private readonly logger = new Logger(OciQueuesService.name);
  private readonly authMode: AuthMode;
  private readonly region: string;
  private readonly messagesEndpoint: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;

  constructor(private readonly config: ConfigService) {
    this.authMode = (this.config.get<string>('OCI_AUTH_MODE') ??
      'instance_principal') as AuthMode;
    this.region = this.config.get<string>('OCI_REGION') ?? '';
    this.messagesEndpoint =
      this.config.get<string>('OCI_QUEUE_MESSAGES_ENDPOINT') ?? '';
    this.maxRetries = Number(
      this.config.get<string>('OCI_QUEUE_MAX_RETRIES') ?? 3,
    );
    this.retryBaseMs = Number(
      this.config.get<string>('OCI_QUEUE_RETRY_BASE_MS') ?? 200,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.init();
  }

  private async init(): Promise<void> {
    if (!this.messagesEndpoint) {
      throw new Error(
        'OCI_QUEUE_MESSAGES_ENDPOINT is required (Queue Messages endpoint).',
      );
    }
    if (!this.region) {
      throw new Error('OCI_REGION is required.');
    }

    if (!OciQueuesService.client) {
      const provider = await this.buildAuthProvider();
      const client = new queue.QueueClient({
        authenticationDetailsProvider: provider,
      });
      client.endpoint = this.messagesEndpoint;
      OciQueuesService.client = client;
    }
    this.logger.log('OCIQueues initialized');
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

  private getClient(): queue.QueueClient {
    if (!OciQueuesService.client) {
      throw new Error('OCI Queue client not initialized.');
    }
    return OciQueuesService.client;
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
          `[OCIQueues] ${label} failed (attempt ${attempt + 1}/${this.maxRetries + 1}): ${String(
            msg,
          )}`,
        );
        if (isLast) break;
        const backoff = this.retryBaseMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    throw lastErr;
  }

  private metaLabel(meta: QueueRef) {
    const namePart = meta.name ? ` name=${meta.name}` : '';
    const chanPart = meta.channel ? ` channel=${meta.channel}` : '';
    return `queueId=${meta.queueId}${namePart}${chanPart}`;
  }

  async putMessages(
    messages: PutMessageInput[] | PutMessageInput,
    meta: PutOpts,
  ) {
    if (!meta?.queueId)
      throw new Error('putMessages: meta.queueId is required');
    const arr = Array.isArray(messages) ? messages : [messages];

    const putMessagesDetails: queue.models.PutMessagesDetails = {
      messages: arr.map((m) => ({ content: m.content })),
      ...(meta.channel ? { channel: meta.channel } : {}),
    };

    const client = this.getClient();

    return this.withRetries(
      async () => {
        const req: queue.requests.PutMessagesRequest = {
          queueId: meta.queueId,
          putMessagesDetails,
        };
        const resp = await client.putMessages(req);
        this.logger.log(
          `[OCIQueues] putMessages ok ${this.metaLabel(meta)} count=${arr.length}`,
        );
        return resp;
      },
      `putMessages(${this.metaLabel(meta)})`,
    );
  }

  async getMessages(meta: GetOpts) {
    if (!meta?.queueId)
      throw new Error('getMessages: meta.queueId is required');
    const limit = meta.limit ?? 10;
    const timeoutInSeconds = meta.timeoutInSeconds ?? 20;
    const visibilityInSeconds = meta.visibilityInSeconds ?? 30;

    const client = this.getClient();

    return this.withRetries(
      async () => {
        const req: queue.requests.GetMessagesRequest = {
          queueId: meta.queueId,
          limit,
          timeoutInSeconds,
          visibilityInSeconds,
          ...(meta.channel ? { channel: meta.channel } : {}),
        };
        const resp = await client.getMessages(req);
        this.logger.log(
          `[OCIQueues] getMessages ok ${this.metaLabel(meta)} limit=${limit} timeout=${timeoutInSeconds}s visibility=${visibilityInSeconds}s`,
        );
        return resp;
      },
      `getMessages(${this.metaLabel(meta)})`,
    );
  }

  async deleteMessages(receipts: string[] | string, meta: DeleteOpts) {
    if (!meta?.queueId)
      throw new Error('deleteMessages: meta.queueId is required');
    const arr = Array.isArray(receipts) ? receipts : [receipts];

    const deleteMessagesDetails: queue.models.DeleteMessagesDetails = {
      entries: arr.map((r) => ({ receipt: r })),
      ...(meta.channel ? { channel: meta.channel } : {}),
    };

    const client = this.getClient();

    return this.withRetries(
      async () => {
        const req: queue.requests.DeleteMessagesRequest = {
          queueId: meta.queueId,
          deleteMessagesDetails,
        };
        const resp = await client.deleteMessages(req);
        this.logger.log(
          `[OCIQueues] deleteMessages ok ${this.metaLabel(meta)} count=${arr.length}`,
        );
        return resp;
      },
      `deleteMessages(${this.metaLabel(meta)})`,
    );
  }

  static queueRef(queueId: string, channel?: string, name?: string): QueueRef {
    return { queueId, channel, name };
  }
}
