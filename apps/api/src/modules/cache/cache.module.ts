import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * 缓存模块
 * 提供简单的内存缓存实现，不需要外部依赖
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
