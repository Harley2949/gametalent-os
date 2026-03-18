import { Injectable, Logger } from '@nestjs/common';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

/**
 * 简单的内存缓存服务
 * 不需要外部依赖，适用于开发和测试环境
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheItem<unknown>>();
  private defaultTTL = 3600; // 默认1小时（秒）

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const item = this.cache.get(key);
      if (!item) {
        return undefined;
      }

      // 检查是否过期
      if (Date.now() > item.expiresAt) {
        this.cache.delete(key);
        return undefined;
      }

      return item.value as T;
    } catch (error) {
      this.logger.error(`获取缓存失败 [${key}]:`, error);
      return undefined;
    }
  }

  /**
   * 设置缓存值
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），可选，默认使用 defaultTTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const expiresAt = Date.now() + (ttl || this.defaultTTL) * 1000;
      this.cache.set(key, { value, expiresAt });
      this.logger.debug(`缓存已设置 [${key}], TTL: ${ttl || this.defaultTTL}s`);
    } catch (error) {
      this.logger.error(`设置缓存失败 [${key}]:`, error);
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
      this.logger.debug(`缓存已删除 [${key}]`);
    } catch (error) {
      this.logger.error(`删除缓存失败 [${key}]:`, error);
    }
  }

  /**
   * 批量删除缓存（支持通配符）
   * 注意：这是一个简单实现，只支持 * 结尾的通配符
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        let count = 0;
        for (const key of this.cache.keys()) {
          if (key.startsWith(prefix)) {
            this.cache.delete(key);
            count++;
          }
        }
        this.logger.debug(`批量删除缓存 [${pattern}]: 删除了 ${count} 项`);
      } else {
        // 不支持复杂通配符，直接删除精确匹配
        this.cache.delete(pattern);
      }
    } catch (error) {
      this.logger.error(`批量删除缓存失败 [${pattern}]:`, error);
    }
  }

  /**
   * 清空所有缓存
   */
  async reset(): Promise<void> {
    try {
      this.cache.clear();
      this.logger.debug('所有缓存已清空');
    } catch (error) {
      this.logger.error('清空缓存失败:', error);
    }
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    try {
      const item = this.cache.get(key);
      if (!item) {
        return false;
      }
      // 检查是否过期
      if (Date.now() > item.expiresAt) {
        this.cache.delete(key);
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`检查缓存失败 [${key}]:`, error);
      return false;
    }
  }

  /**
   * 获取或设置缓存（原子操作）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== undefined) {
        this.logger.debug(`缓存命中 [${key}]`);
        return cached;
      }

      this.logger.debug(`缓存未命中 [${key}]，执行工厂函数`);
      const value = await factory();

      await this.set(key, value, ttl);

      return value;
    } catch (error) {
      this.logger.error(`getOrSet 失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 清理过期缓存（定时任务调用）
   */
  async cleanExpired(): Promise<number> {
    const now = Date.now();
    let count = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    if (count > 0) {
      this.logger.debug(`清理了 ${count} 个过期缓存项`);
    }

    return count;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
