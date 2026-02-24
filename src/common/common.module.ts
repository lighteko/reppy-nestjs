import { Global, Module } from '@nestjs/common';
import { TokensService } from '@/common/auth/tokens.service';
import { AuthGuard } from '@/common/auth/auth.guard';
import { AdminGuard } from '@/common/auth/admin.guard';
import { OciQueuesService } from '@/common/oci/queues.service';
import { OciObjectStorageService } from '@/common/oci/objectstorage.service';
import { OciStreamingService } from '@/common/oci/streaming.service';

@Global()
@Module({
  providers: [
    TokensService,
    AuthGuard,
    AdminGuard,
    OciQueuesService,
    OciObjectStorageService,
    OciStreamingService,
  ],
  exports: [
    TokensService,
    AuthGuard,
    AdminGuard,
    OciQueuesService,
    OciObjectStorageService,
    OciStreamingService,
  ],
})
export class CommonModule {}
