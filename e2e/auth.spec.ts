/**
 * 认证流程 E2E 测试
 *
 * 测试用户登录、登出、权限保护等功能
 */

import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
  });

  test('应该显示登录页面', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('MiAO AI Native');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('应该成功登录并跳转到仪表板', async ({ page }) => {
    // 填写登录表单
    await page.fill('input[type="email"]', 'admin@gametalent.os');
    await page.fill('input[type="password"]', 'admin123');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待导航到仪表板
    await page.waitForURL('/dashboard');

    // 验证登录成功
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('仪表板');
  });

  test('应该在登录失败时显示错误信息', async ({ page }) => {
    // 填写错误的凭据
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 验证错误提示
    await expect(page.locator('text=登录失败')).toBeVisible();
  });

  test('应该支持测试账号快捷填充', async ({ page }) => {
    // 点击"测试账号"按钮
    await page.click('text=测试账号');

    // 验证表单已填充
    const email = await page.inputValue('input[type="email"]');
    const password = await page.inputValue('input[type="password"]');

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();
  });

  test('未登录时访问受保护页面应该重定向到登录页', async ({ page }) => {
    // 清除 localStorage（确保未登录状态）
    await page.context().clearCookies();

    // 尝试直接访问受保护页面
    await page.goto('/candidates');

    // 应该重定向到登录页
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('登出流程', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@gametalent.os');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('应该成功登出并跳转到登录页', async ({ page }) => {
    // 点击用户菜单
    await page.click('[data-testid="user-menu"]');

    // 点击登出按钮
    await page.click('text=登出');

    // 验证重定向到登录页
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('登出后无法访问受保护页面', async ({ page }) => {
    // 登出
    await page.click('[data-testid="user-menu"]');
    await page.click('text=登出');
    await page.waitForURL('/login');

    // 尝试访问受保护页面
    await page.goto('/dashboard');

    // 应该重定向到登录页
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });
});
