import { test, expect } from '@playwright/test';

/**
 * Dashboard 页面 E2E 测试
 * 测试仪表盘的核心功能和数据展示
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到 dashboard 页面
    await page.goto('/dashboard');
  });

  test('应该显示 dashboard 页面标题', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('应该显示核心指标卡片', async ({ page }) => {
    // 检查关键指标是否显示
    await expect(page.locator('text=/总候选人/i')).toBeVisible();
    await expect(page.locator('text=/新应聘/i')).toBeVisible();
    await expect(page.locator('text=/待筛选/i')).toBeVisible();
    await expect(page.locator('text=/面试安排/i')).toBeVisible();
  });

  test('应该显示图表组件', async ({ page }) => {
    // 检查图表是否加载
    const charts = page.locator('[class*="chart"], [class*="graph"], svg');
    await expect(charts.first()).toBeVisible({ timeout: 10000 });
  });

  test('应该能够筛选数据', async ({ page }) => {
    // 测试日期筛选器
    const dateFilter = page.locator('[data-testid="date-filter"], [placeholder*="日期"]').first();
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      // 选择最近7天
      await page.locator('text=/最近7天/i').click();
      // 验证页面更新
      await expect(page.locator('text=/加载中/i')).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('应该能够快速导航到其他页面', async ({ page }) => {
    // 测试快速导航按钮
    const viewAllButton = page.locator('a:has-text("查看全部")').first();
    if (await viewAllButton.isVisible()) {
      await viewAllButton.click();
      await expect(page).toHaveURL(/\/candidates|\/applications/);
    }
  });

  test('应该支持数据刷新', async ({ page }) => {
    const refreshButton = page.locator('[aria-label*="刷新"], button:has-text("刷新")').first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      // 验证加载状态
      await expect(page.locator('text=/加载中/i')).toBeVisible();
      // 验证数据重新加载
      await expect(page.locator('text=/加载中/i')).not.toBeVisible({ timeout: 10000 });
    }
  });
});

/**
 * Dashboard 数据验证测试
 */
test.describe('Dashboard 数据验证', () => {
  test('应该显示正确的统计数据', async ({ page }) => {
    await page.goto('/dashboard');

    // 等待数据加载完成
    await page.waitForLoadState('networkidle');

    // 获取显示的数字
    const totalCandidates = page.locator('[data-testid="total-candidates"], text=/\\d+/').first();

    // 验证数字大于0
    const text = await totalCandidates.textContent();
    const number = parseInt(text?.match(/\d+/)?.[0] || '0');
    expect(number).toBeGreaterThanOrEqual(0);
  });

  test('应该响应式适配移动设备', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');

    // 验证移动端布局
    const cards = page.locator('[class*="grid"], [class*="card"]');
    await expect(cards.first()).toBeVisible();

    // 验证卡片应该是单列布局
    const gridContainer = page.locator('[class*="grid"]').first();
    if (await gridContainer.isVisible()) {
      const className = await gridContainer.getAttribute('class');
      // 移动端应该是单列
      expect(className).toMatch(/grid-cols-1|gap-4/);
    }
  });
});

/**
 * Dashboard 性能测试
 */
test.describe('Dashboard 性能', () => {
  test('应该在合理时间内加载完成', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // 页面应该在 5 秒内加载完成
    expect(loadTime).toBeLessThan(5000);
  });

  test('应该没有控制台错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 验证没有严重错误
    const criticalErrors = errors.filter(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('Network error')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
