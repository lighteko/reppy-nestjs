import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';
import * as path from 'path';
import { createReadStream } from 'fs';
import { Readable } from 'stream';

type AuthMode = 'instance_principal' | 'config_file';

@Injectable()
export class OciObjectStorageService implements OnModuleInit {
  private static client: objectstorage.ObjectStorageClient | null = null;
  private readonly logger = new Logger(OciObjectStorageService.name);
  private readonly authMode: AuthMode;
  private readonly region: string;
  private readonly namespace: string;
  private readonly bucket: string;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;

  constructor(private readonly config: ConfigService) {
    this.authMode = (this.config.get<string>('OCI_AUTH_MODE') ??
      'instance_principal') as AuthMode;
    this.region = this.config.get<string>('OCI_REGION') ?? '';
    this.namespace =
      this.config.get<string>('OCI_OBJECT_STORAGE_NAMESPACE') ?? '';
    this.bucket = this.config.get<string>('OCI_OBJECT_STORAGE_BUCKET') ?? '';
    this.maxRetries = Number(
      this.config.get<string>('OCI_OS_MAX_RETRIES') ?? 3,
    );
    this.retryBaseMs = Number(
      this.config.get<string>('OCI_OS_RETRY_BASE_MS') ?? 200,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.init();
  }

  private async init(): Promise<void> {
    if (!this.region) throw new Error('OCI_REGION is required.');
    if (!this.namespace)
      throw new Error('OCI_OBJECT_STORAGE_NAMESPACE is required.');
    if (!this.bucket) throw new Error('OCI_OBJECT_STORAGE_BUCKET is required.');

    if (!OciObjectStorageService.client) {
      const provider = await this.buildAuthProvider();
      const client = new objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
      });
      client.regionId = this.region;
      OciObjectStorageService.client = client;
    }
    this.logger.log('OCIObjectStorage initialized');
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

  private getClient(): objectstorage.ObjectStorageClient {
    if (!OciObjectStorageService.client)
      throw new Error('OCI Object Storage client not initialized.');
    return OciObjectStorageService.client;
  }

  private async withRetries<T>(
    fn: () => Promise<T>,
    label: string,
  ): Promise<T> {
    let lastErr: any;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastErr = err;
        const isLast = attempt === this.maxRetries;
        this.logger.error(
          `[OCIObjectStorage] ${label} failed (attempt ${attempt + 1}/${this.maxRetries + 1}): ${String(
            err?.message ?? err,
          )}`,
        );
        if (isLast) break;
        const backoff = this.retryBaseMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
    throw lastErr;
  }

  private buildObjectUrl(
    bucket: string,
    objectName: string,
    region = this.region,
  ): string {
    const encodedObject = objectName
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');
    return `https://objectstorage.${region}.oraclecloud.com/n/${this.namespace}/b/${bucket}/o/${encodedObject}`;
  }

  async uploadFile(
    fileLocalPath: string,
    objectName?: string,
    bucket: string = this.bucket,
  ): Promise<string> {
    const client = this.getClient();
    const key = objectName || path.basename(fileLocalPath);
    const body = createReadStream(fileLocalPath);

    await this.withRetries(async () => {
      await client.putObject({
        namespaceName: this.namespace,
        bucketName: bucket,
        objectName: key,
        putObjectBody: body,
      });
    }, `putObject(uploadFile) bucket=${bucket} key=${key}`);

    this.logger.log(
      `[OCIObjectStorage] uploadFile ok bucket=${bucket} key=${key}`,
    );
    return this.buildObjectUrl(bucket, key);
  }

  async uploadFileObject(
    fileBuffer: Buffer,
    objectName: string,
    bucket: string = this.bucket,
  ): Promise<string> {
    const client = this.getClient();
    const body = Readable.from(fileBuffer);

    await this.withRetries(async () => {
      await client.putObject({
        namespaceName: this.namespace,
        bucketName: bucket,
        objectName,
        putObjectBody: body,
        contentLength: fileBuffer.length,
      });
    }, `putObject(uploadFileObject) bucket=${bucket} key=${objectName}`);

    this.logger.log(
      `[OCIObjectStorage] uploadFileObject ok bucket=${bucket} key=${objectName}`,
    );
    return this.buildObjectUrl(bucket, objectName);
  }

  async deleteFileObject(
    objectName: string,
    bucket: string = this.bucket,
  ): Promise<void> {
    const client = this.getClient();
    await this.withRetries(async () => {
      await client.deleteObject({
        namespaceName: this.namespace,
        bucketName: bucket,
        objectName,
      });
    }, `deleteObject bucket=${bucket} key=${objectName}`);
    this.logger.log(
      `[OCIObjectStorage] delete ok bucket=${bucket} key=${objectName}`,
    );
  }

  private async readStreamToBuffer(value: any): Promise<Buffer> {
    if (value && typeof value[Symbol.asyncIterator] === 'function') {
      const chunks: Buffer[] = [];
      for await (const chunk of value as AsyncIterable<any>) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }

    if (value && typeof (value as any).getReader === 'function') {
      const reader = (value as any).getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value: v } = await reader.read();
        if (done) break;
        if (v) chunks.push(v);
      }
      const total = chunks.reduce((s, c) => s + c.byteLength, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.byteLength;
      }
      return Buffer.from(merged);
    }

    return Buffer.from(String(value ?? ''), 'utf-8');
  }

  async getObject(
    objectName: string,
    bucket: string = this.bucket,
  ): Promise<string> {
    const client = this.getClient();

    const res = await this.withRetries(async () => {
      return client.getObject({
        namespaceName: this.namespace,
        bucketName: bucket,
        objectName,
      });
    }, `getObject bucket=${bucket} key=${objectName}`);

    if (!res.value) {
      this.logger.warn(
        `[OCIObjectStorage] getObject empty body bucket=${bucket} key=${objectName}`,
      );
      return '';
    }

    const buf = await this.readStreamToBuffer(res.value);
    const bodyString = buf.toString('utf-8');

    const trimmed = bodyString.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const jsonObj = JSON.parse(trimmed);
        if (jsonObj && typeof jsonObj === 'object' && 'html' in jsonObj) {
          const html = (jsonObj as any).html;
          return typeof html === 'string' ? html : JSON.stringify(html);
        }
        return JSON.stringify(jsonObj);
      } catch {
        // ignore and return raw
      }
    }

    return bodyString;
  }
}
