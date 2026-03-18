import { test, expect } from '@playwright/test';

/**
 * 应聘管理完整流程测试
 * 测试从创建应聘到录用的完整生命周期
 */

test.describe('应聘管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录系统
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@gametalent.com');
    await page.fill('[name="password"]', 'test123456');
    await page.click('button[type="submit"]');

    // 等待登录成功并跳转到 dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('完整应聘流程：创建 -> 面试 -> 录用', async ({ page }) => {
    // 1. 创建新应聘
    await page.goto('/applications/new');

    // 填写应聘信息
    await page.fill('[name="candidateName"]', '张三');
    await page.fill('[name="candidateEmail"]', 'zhangsan@example.com');
    await page.fill('[name="candidatePhone"]', '13800138000');
    await page.selectOption('[name="position"]', 'Unity开发工程师');
    await page.fill('[name="resume"]', '这是模拟的简历内容...');

    // 提交应聘
    await page.click('button:has-text("提交应聘")');

    // 验证创建成功
    await expect(page.locator('text=/应聘创建成功/i')).toBeVisible();
    await expect(page).toHaveURL(/\/applications/);

    // 2. 筛选应聘
    await page.goto('/applications');

    // 找到刚创建的应聘记录
    const applicationCard = page.locator(`text=/张三/`).first();
    await expect(applicationCard).toBeVisible();

    // 拖拽到"筛选中"列
    const application = page.locator('[data-application-id]').first();
    const screeningColumn = page.locator('[data-column-status="screening"]').first();

    // 模拟拖拽操作
    await application.dragTo(screeningColumn);

    // 验证状态更新
    await expect(page.locator('text=/状态已更新/i')).toBeVisible();

    // 3. 安排面试
    await page.click(`text=/张三/`);
    await expect(page).toHaveURL(/\/applications\/\w+/);

    // 点击安排面试按钮
    await page.click('button:has-text("安排面试")');

    // 填写面试信息
    await page.fill('[name="interviewDate"]', '2026-03-25');
    await page.fill('[name="interviewTime"]', '14:00');
    await page.selectOption('[name="interviewType"]', 'technical');
    await page.selectOption('[name="interviewer"]', '技术面试官');

    await page.click('button:has-text("保存")');

    // 验证面试创建成功
    await expect(page.locator('text=/面试安排成功/i')).toBeVisible();

    // 4. 面试评价
    await page.goto('/applications');
    await page.click(`text=/张三/`);

    // 点击添加评价
    await page.click('button:has-text("添加评价")');

    // 填写评价
    await page.selectOption('[name="rating"]', '5');
    await page.fill('[name="feedback"]', '技术能力强，沟通良好，推荐录用');
    await page.selectOption('[name="recommendation"]', 'hire');

    await page.click('button:has-text("提交评价")');

    // 验证评价提交成功
    await expect(page.locator('text=/评价已提交/i')).toBeVisible();

    // 5. 录用候选人
    await page.click('button:has-text("录用")');

    // 填写录用信息
    await page.fill('[name="salary"]', '25000');
    await page.fill('[name="startDate"]', '2026-04-01');
    await page.fill('[name="notes"]', '期待加入！');

    await page.click('button:has-text("发送录用通知")');

    // 验证录用流程完成
    await expect(page.locator('text=/录用通知已发送/i')).toBeVisible();
  });

  test('应该能够批量操作应聘记录', async ({ page }) => {
    await page.goto('/applications');

    // 选择多个应聘记录
    await page.check('[data-application-id]:first-of-type input[type="checkbox"]');
    await page.check('[data-application-id]:nth-of-type(2) input[type="checkbox"]');

    // 批量分配给面试官
    await page.click('button:has-text("批量操作")');
    await page.click('text=/分配面试官/i');
    await page.selectOption('[name="assignTo"]', '面试官A');
    await page.click('button:has-text("确定")');

    // 验证批量操作成功
    await expect(page.locator('text=/已分配 \d+ 位候选人/i')).toBeVisible();
  });

  test('应该能够搜索和筛选应聘', async ({ page }) => {
    await page.goto('/applications');

    // 测试搜索功能
    await page.fill('[placeholder*="搜索"]', 'Unity');
    await page.press('[placeholder*="搜索"]', 'Enter');

    // 验证搜索结果
    await expect(page.locator('text=/Unity/i').first()).toBeVisible();

    // 测试筛选器
    await page.click('[data-testid="filter-button"]');
    await page.selectOption('[name="status"]', 'interview');
    await page.click('button:has-text("应用筛选")');

    // 验证筛选结果
    await expect(page.locator('[data-column-status="interview"]')).toBeVisible();
  });
});

/**
 * 候选人管理测试
 */
test.describe('候选人管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@gametalent.com');
    await page.fill('[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('应该能够添加新候选人', async ({ page }) => {
    await page.goto('/candidates/new');

    // 填写候选人信息
    await page.fill('[name="name"]', '李四');
    await page.fill('[name="email"]', 'lisi@example.com');
    await page.fill('[name="phone"]', '13900139000');
    await page.fill('[name="currentCompany"]', '腾讯游戏');
    await page.fill('[name="currentPosition"]', '客户端开发');
    await page.selectOption('[name="education"]', '硕士');
    await page.fill('[name="school"]', '清华大学');
    await page.fill('[name="major"]', '计算机科学');

    // 上传简历
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock resume content')
    });

    // 提交
    await page.click('button:has-text("保存候选人")');

    // 验证创建成功
    await expect(page.locator('text=/候选人已添加/i')).toBeVisible();
    await expect(page).toHaveURL(/\/candidates/);
  });

  test('应该能够查看候选人详情', async ({ page }) => {
    await page.goto('/candidates');

    // 点击第一个候选人
    await page.click('[data-candidate-id]:first-of-type');

    // 验证详情页面加载
    await expect(page.locator('[data-testid="candidate-details"]')).toBeVisible();
    await expect(page.locator('text=/基本信息/i')).toBeVisible();
    await expect(page.locator('text=/工作经历/i')).toBeVisible();
    await expect(page.locator('text=/教育背景/i')).toBeVisible();
  });

  test('应该能够编辑候选人信息', async ({ page }) => {
    await page.goto('/candidates');
    await page.click('[data-candidate-id]:first-of-type');
    await page.click('button:has-text("编辑")');

    // 修改信息
    await page.fill('[name="phone"]', '13999999999');
    await page.click('button:has-text("保存")');

    // 验证更新成功
    await expect(page.locator('text=/信息已更新/i')).toBeVisible();
    await expect(page.locator('text=/13999999999/i')).toBeVisible();
  });
});

/**
 * 招聘看板测试
 */
test.describe('招聘看板', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@gametalent.com');
    await page.fill('[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('应该显示所有应聘阶段的列', async ({ page }) => {
    await page.goto('/applications');

    // 验证所有列都存在
    const columns = ['新应聘', '筛选中', '初试', '复试', '录用', '已拒绝'];
    for (const column of columns) {
      await expect(page.locator(`text=/${column}/i`).first()).toBeVisible();
    }
  });

  test('应该支持拖拽改变应聘状态', async ({ page }) => {
    await page.goto('/applications');

    // 获取第一列中的应聘数量
    const firstColumn = page.locator('[data-column-status]:first-of-type');
    const beforeCount = await firstColumn.locator('[data-application-id]').count();

    // 拖拽一个应聘到第二列
    const application = firstColumn.locator('[data-application-id]').first();
    const secondColumn = page.locator('[data-column-status]:nth-of-type(2)');

    await application.dragTo(secondColumn);

    // 等待动画完成
    await page.waitForTimeout(500);

    // 验证拖拽成功
    const afterCount = await firstColumn.locator('[data-application-id]').count();
    expect(afterCount).toBe(beforeCount - 1);
  });

  test('应该能够快速筛选应聘列表', async ({ page }) => {
    await page.goto('/applications');

    // 使用顶部快速筛选按钮
    await page.click('[data-testid="quick-filter-interview"]');
    await page.waitForTimeout(500);

    // 验证只显示面试中的应聘
    const interviewColumn = page.locator('[data-column-status="interview"]');
    const hasCards = await interviewColumn.locator('[data-application-id]').count() > 0;
    expect(hasCards).toBeTruthy();
  });
});

/**
 * 数据统计和分析测试
 */
test.describe('数据统计', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@gametalent.com');
    await page.fill('[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
  });

  test('应该显示招聘漏斗数据', async ({ page }) => {
    await page.goto('/dashboard');

    // 验证漏斗图显示
    await expect(page.locator('[data-testid="funnel-chart"]')).toBeVisible();
  });

  test('应该显示应聘趋势图', async ({ page }) => {
    await page.goto('/dashboard');

    // 验证趋势图显示
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();

    // 测试时间范围切换
    await page.click('[data-testid="time-range-30d"]');
    await page.waitForTimeout(1000);

    // 验证图表更新
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
  });

  test('应该导出数据报表', async ({ page }) => {
    await page.goto('/dashboard');

    // 点击导出按钮
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("导出报表")');
    const download = await downloadPromise;

    // 验证下载的文件
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv)$/);
  });
});
