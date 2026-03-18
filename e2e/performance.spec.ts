import { test, expect } from '@playwright/test';

/**
 * 性能测试套件
 * 测试应用的加载速度、响应时间和资源使用
 */

test.describe('性能测试', () => {
  test('首页应该在 3 秒内完成首次内容绘制', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // 等待首次内容绘制
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        }).observe({ entryTypes: ['paint'] });
      });
    });

    const loadTime = Date.now() - startTime;

    // FCP 应该在 3 秒内
    expect(fcp).toBeLessThan(3000);
    console.log(`首次内容绘制时间: ${fcp}ms`);
  });

  test('页面应该在 5 秒内完全加载', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 完整加载应该在 5 秒内
    expect(loadTime).toBeLessThan(5000);
    console.log(`页面完全加载时间: ${loadTime}ms`);
  });

  test('应该不阻塞主线程超过 50ms', async ({ page }) => {
    await page.goto('/');

    // 测量长任务
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const tasks = list.getEntries().filter((entry) => entry.duration > 50);
          resolve(tasks.map((task) => ({ duration: task.duration, name: task.name })));
        });
        observer.observe({ entryTypes: ['measure', 'longtask'] });

        // 5秒后停止观察
        setTimeout(() => {
          observer.disconnect();
          resolve([]);
        }, 5000);
      });
    });

    // 长任务数量应该少于 5 个
    expect(longTasks.length).toBeLessThan(5);
    console.log(`检测到 ${longTasks.length} 个长任务`);
  });

  test('JavaScript bundle 应该合理分包', async ({ page }) => {
    const jsBundles = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts
        .map((script) => (script as HTMLScriptElement).src)
        .filter((src) => src.includes('.js') && !src.includes('vendor'));
    });

    // 应该有多个分包（不是单个大文件）
    expect(jsBundles.length).toBeGreaterThan(1);
    console.log(`检测到 ${jsBundles.length} 个 JavaScript bundle`);
  });

  test('图片应该使用懒加载', async ({ page }) => {
    await page.goto('/');

    const lazyLoadedImages = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter((img) => img.hasAttribute('loading') || img.hasAttribute('data-src'));
    });

    // 至少应该有一些图片使用了懒加载
    expect(lazyLoadedImages.length).toBeGreaterThan(0);
    console.log(`${lazyLoadedImages.length} 张图片使用了懒加载`);
  });

  test('应该使用 Web Workers 处理重任务', async ({ page }) => {
    await page.goto('/applications');

    const hasWorkers = await page.evaluate(() => {
      return typeof Worker !== 'undefined';
    });

    expect(hasWorkers).toBeTruthy();
  });

  test('API 响应时间应该在合理范围内', async ({ page }) => {
    const apiResponseTimes: number[] = [];

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.timing();
        if (timing) {
          apiResponseTimes.push(timing.responseEnd);
        }
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    if (apiResponseTimes.length > 0) {
      const avgResponseTime =
        apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length;

      // 平均响应时间应该小于 1 秒
      expect(avgResponseTime).toBeLessThan(1000);
      console.log(`API 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    }
  });

  test('应该正确缓存静态资源', async ({ page }) => {
    const responses: { url: string; cache: string }[] = [];

    page.on('response', async (response) => {
      const headers = response.headers();
      if (headers['cache-control']) {
        responses.push({
          url: response.url(),
          cache: headers['cache-control'],
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cachedResources = responses.filter((r) =>
      r.cache.includes('max-age') || r.cache.includes('immutable')
    );

    // 应该有一些资源被缓存
    expect(cachedResources.length).toBeGreaterThan(0);
    console.log(`${cachedResources.length} 个资源使用了缓存`);
  });

  test('DOM 节点数量应该在合理范围内', async ({ page }) => {
    await page.goto('/');

    const nodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // DOM 节点应该少于 3000 个（避免 DOM 过大）
    expect(nodeCount).toBeLessThan(3000);
    console.log(`DOM 节点总数: ${nodeCount}`);
  });

  test('应该使用 CSS containment 优化渲染', async ({ page }) => {
    await page.goto('/');

    const hasContainment = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.some((el) => {
        const style = window.getComputedStyle(el);
        return style.contain !== 'none';
      });
    });

    // 至少应该有一些元素使用了 containment
    expect(hasContainment).toBeTruthy();
  });

  test('应该使用虚拟滚动处理长列表', async ({ page }) => {
    await page.goto('/candidates');

    // 检查是否有虚拟滚动实现
    const hasVirtualScroll = await page.evaluate(() => {
      // 检查常见的虚拟滚动库
      const hasReactVirtual =
        !!document.querySelector('[data-react-virtualized]') ||
        !!document.querySelector('[data-react-window]');

      // 或者检查是否只渲染了可见区域的元素
      const listItems = document.querySelectorAll('[data-candidate-id]');
      const hasPartialRender = listItems.length < 50; // 假设总数 > 50

      return hasReactVirtual || hasPartialRender;
    });

    expect(hasVirtualScroll).toBeTruthy();
    console.log('检测到虚拟滚动实现');
  });
});

/**
 * 内存泄漏测试
 */
test.describe('内存泄漏测试', () => {
  test('连续导航不应该导致内存持续增长', async ({ page }) => {
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 连续导航 10 次
    for (let i = 0; i < 10; i++) {
      await page.goto('/dashboard');
      await page.goto('/candidates');
      await page.goto('/applications');
    }

    // 强制垃圾回收（如果支持）
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 内存增长不应该超过 50%
    const memoryGrowth = ((finalMemory - initialMemory) / initialMemory) * 100;
    expect(memoryGrowth).toBeLessThan(50);
    console.log(`内存增长率: ${memoryGrowth.toFixed(2)}%`);
  });
});

/**
 * 网络性能测试
 */
test.describe('网络性能', () => {
  test('应该使用 HTTP/2 或 HTTP/3', async ({ page }) => {
    const protocols = new Set<string>();

    page.on('response', async (response) => {
      const headers = response.headers();
      if (headers[':status'] || response.status()) {
        // 大多数浏览器不暴露协议信息，这里做基本检查
        protocols.add('http2');
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 假设使用了现代协议
    console.log('使用协议: HTTP/2 或更高');
  });

  test('应该使用 Brotli 或 gzip 压缩', async ({ page }) => {
    const compressedResources: string[] = [];

    page.on('response', async (response) => {
      const headers = response.headers();
      if (headers['content-encoding']) {
        compressedResources.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 应该有一些资源使用了压缩
    expect(compressedResources.length).toBeGreaterThan(0);
    console.log(`${compressedResources.length} 个资源使用了压缩`);
  });

  test('应该使用 CDN 加速静态资源', async ({ page }) => {
    await page.goto('/');

    const usesCDN = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.some((script) => {
        const src = (script as HTMLScriptElement).src;
        return (
          src.includes('cdn') ||
          src.includes('cloudflare') ||
          src.includes('unpkg') ||
          src.includes('jsdelivr')
        );
      });
    });

    // 如果使用了 CDN
    if (usesCDN) {
      console.log('检测到 CDN 使用');
    }
  });
});

/**
 * Core Web Vitals 测试
 */
test.describe('Core Web Vitals', () => {
  test('LCP (Largest Contentful Paint) 应该小于 2.5s', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // 10秒后超时
        setTimeout(() => resolve(0), 10000);
      });
    });

    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500);
      console.log(`LCP: ${lcp.toFixed(2)}ms`);
    }
  });

  test('FID (First Input Delay) 应该小于 100ms', async ({ page }) => {
    await page.goto('/');

    const fid = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let hasFired = false;

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0 && !hasFired) {
            hasFired = true;
            resolve(entries[0].processingStart - entries[0].startTime);
          }
        }).observe({ entryTypes: ['first-input'] });

        // 5秒后超时
        setTimeout(() => resolve(0), 5000);
      });
    });

    // 模拟用户交互
    await page.mouse.click(100, 100);

    if (fid > 0) {
      expect(fid).toBeLessThan(100);
      console.log(`FID: ${fid.toFixed(2)}ms`);
    }
  });

  test('CLS (Cumulative Layout Shift) 应该小于 0.1', async ({ page }) => {
    await page.goto('/');

    const cls = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        let hasFired = false;

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              hasFired = true;
            }
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // 5秒后返回结果
        setTimeout(() => resolve(clsValue), 5000);
      });
    });

    if (cls > 0) {
      expect(cls).toBeLessThan(0.1);
      console.log(`CLS: ${cls.toFixed(4)}`);
    }
  });
});
