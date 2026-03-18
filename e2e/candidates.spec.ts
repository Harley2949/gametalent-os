/**
 * 候选人管理 E2E 测试
 *
 * 测试候选人列表、创建、编辑、删除等功能
 */

import { test, expect } from '@playwright/test';

test.describe('候选人管理', () => {
  // 每个测试前先登录
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@gametalent.os');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('应该显示候选人列表页面', async ({ page }) => {
    await page.goto('/candidates');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('候选人');

    // 验证搜索框存在
    await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();

    // 验证"新建候选人"按钮存在
    await expect(page.locator('text=新建候选人')).toBeVisible();
  });

  test('应该能够搜索候选人', async ({ page }) => {
    await page.goto('/candidates');

    // 输入搜索关键词
    await page.fill('input[placeholder*="搜索"]', '张三');

    // 等待搜索结果
    await page.waitForTimeout(500);

    // 验证搜索结果（假设有匹配结果）
    const results = page.locator('table tbody tr');
    const count = await results.count();

    // 如果有结果，验证至少有一个
    if (count > 0) {
      await expect(results.first()).toBeVisible();
    }
  });

  test('应该能够创建新候选人', async ({ page }) => {
    await page.goto('/candidates');

    // 点击"新建候选人"按钮
    await page.click('text=新建候选人');

    // 等待导航到新建页面
    await page.waitForURL('/candidates/new');

    // 填写表单
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="name"]', '测试候选人');
    await page.fill('input[name="phoneNumber"]', '13800138000');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待重定向到详情页
    await page.waitForURL(/\/candidates\/[a-z0-9]+/);

    // 验证成功提示
    await expect(page.locator('text=创建成功')).toBeVisible();
  });

  test('应该能够查看候选人详情', async ({ page }) => {
    await page.goto('/candidates');

    // 点击第一个候选人
    const firstCandidate = page.locator('table tbody tr').first();
    await firstCandidate.click();

    // 等待导航到详情页
    await page.waitForURL(/\/candidates\/[a-z0-9]+/);

    // 验证详情页元素
    await expect(page.locator('h1')).toContainText('候选人详情');
    await expect(page.locator('text=基本信息')).toBeVisible();
  });

  test('应该能够编辑候选人信息', async ({ page }) => {
    await page.goto('/candidates');

    // 点击第一个候选人的"编辑"按钮
    await page.locator('table tbody tr').first().locator('text=编辑').click();

    // 等待导航到编辑页面
    await page.waitForURL(/\/candidates\/[a-z0-9]+\/edit/);

    // 修改姓名
    const newName = '修改后的姓名';
    await page.fill('input[name="name"]', newName);

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证成功提示
    await expect(page.locator('text=更新成功')).toBeVisible();

    // 返回详情页验证修改
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('应该能够删除候选人', async ({ page }) => {
    await page.goto('/candidates');

    // 获取初始候选人数量
    const initialCount = await page.locator('table tbody tr').count();

    // 点击第一个候选人的"删除"按钮
    page.on('dialog', dialog => dialog.accept());
    await page.locator('table tbody tr').first().locator('text=删除').click();

    // 等待删除完成
    await page.waitForTimeout(1000);

    // 验证候选人数量减少
    const newCount = await page.locator('table tbody tr').count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test('应该能够使用标签筛选', async ({ page }) => {
    await page.goto('/candidates');

    // 点击筛选器
    await page.click('[data-testid="filter-button"]');

    // 选择一个标签
    await page.click('text=unity');

    // 等待筛选结果
    await page.waitForTimeout(500);

    // 验证 URL 包含筛选参数
    expect(page.url()).toContain('tags=');
  });

  test('返回按钮应该正确工作', async ({ page }) => {
    await page.goto('/candidates');

    // 点击第一个候选人
    await page.locator('table tbody tr').first().click();

    // 等待导航到详情页
    await page.waitForURL(/\/candidates\/[a-z0-9]+/);

    // 点击返回按钮
    await page.click('text=返回');

    // 验证返回到列表页
    await page.waitForURL('/candidates');
    await expect(page.locator('h1')).toContainText('候选人');
  });
});

test.describe('候选人详情页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@gametalent.os');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 导航到候选人详情页（假设存在候选人）
    await page.goto('/candidates');
    await page.locator('table tbody tr').first().click();
    await page.waitForURL(/\/candidates\/[a-z0-9]+/);
  });

  test('应该显示简历预览', async ({ page }) => {
    // 验证简历预览区域存在
    await expect(page.locator('[data-testid="resume-preview"]')).toBeVisible();
  });

  test('应该能够更新候选人阶段', async ({ page }) => {
    // 点击不同的阶段按钮
    await page.click('text=面试');

    // 验证阶段已更新
    await expect(page.locator('text=阶段已更新')).toBeVisible();
  });

  test('应该能够添加标签', async ({ page }) => {
    // 点击添加标签按钮
    await page.click('[data-testid="add-tag-button"]');

    // 输入标签名称
    await page.fill('input[placeholder*="标签"]', '新标签');

    // 提交
    await page.click('button:has-text("添加")');

    // 验证标签已添加
    await expect(page.locator('text=新标签')).toBeVisible();
  });
});
