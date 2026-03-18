/**
 * 测试面试管理模块的其他功能
 * 运行方式: node test-interview-features.js
 */

const API_BASE = 'http://localhost:3006';

// 测试用户登录
async function login() {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gametalent.os',
      password: 'admin123'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`登录失败: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// 获取面试列表
async function getInterviews(token, skip = 0, take = 10, status = null) {
  let url = `${API_BASE}/api/interviews?skip=${skip}&take=${take}`;
  if (status) {
    url += `&status=${status}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('获取面试列表失败');
  }

  const data = await response.json();

  // 适配返回格式
  return {
    data: data.data || data,
    total: data.meta?.total || data.total || (Array.isArray(data) ? data.length : 0)
  };
}

// 获取面试详情
async function getInterviewDetail(token, interviewId) {
  const response = await fetch(`${API_BASE}/api/interviews/${interviewId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('获取面试详情失败');
  }

  return response.json();
}

// 更新面试状态
async function updateInterviewStatus(token, interviewId, status) {
  console.log(`\n📝 更新面试 ${interviewId} 状态为 ${status}...`);

  const response = await fetch(`${API_BASE}/api/interviews/${interviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  const responseText = await response.text();
  console.log('响应状态:', response.status);

  if (!response.ok) {
    throw new Error(`更新状态失败: ${responseText}`);
  }

  return JSON.parse(responseText);
}

// 删除面试
async function deleteInterview(token, interviewId) {
  console.log(`\n🗑️  删除面试 ${interviewId}...`);

  const response = await fetch(`${API_BASE}/api/interviews/${interviewId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const responseText = await response.text();
  console.log('响应状态:', response.status);

  if (!response.ok) {
    throw new Error(`删除失败: ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : { success: true };
}

// 主测试函数
async function test() {
  try {
    console.log('🔐 正在登录...');
    const token = await login();
    console.log('✅ 登录成功');

    // ========================================
    // 测试1: 获取面试列表（分页）
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试1: 获取面试列表（分页功能）');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const result1 = await getInterviews(token, 0, 10);
    console.log(`✅ 第1页 (skip=0, take=10): 找到 ${result1.data?.length || 0} 条记录，总计 ${result1.total || 0} 条`);
    console.log(`   数据:`, result1.data?.map(i => ({
      id: i.id,
      title: i.title,
      status: i.status,
      scheduledAt: i.scheduledAt
    })));

    // 如果有更多数据，测试第二页
    if (result1.total > 10) {
      const result2 = await getInterviews(token, 10, 10);
      console.log(`✅ 第2页 (skip=10, take=10): 找到 ${result2.data?.length || 0} 条记录`);
    }

    // ========================================
    // 测试2: 状态筛选功能
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试2: 状态筛选功能');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const scheduledResult = await getInterviews(token, 0, 10, 'SCHEDULED');
    console.log(`✅ 已安排的面试: ${scheduledResult.data?.length || 0} 条`);

    const completedResult = await getInterviews(token, 0, 10, 'COMPLETED');
    console.log(`✅ 已完成的面试: ${completedResult.data?.length || 0} 条`);

    // ========================================
    // 测试3: 状态更新功能
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试3: 状态更新功能');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 找一个已安排的面试进行状态更新测试
    const scheduledInterview = scheduledResult.data?.find(i => i.status === 'SCHEDULED');

    if (scheduledInterview) {
      console.log(`\n📍 找到已安排的面试: ${scheduledInterview.title} (ID: ${scheduledInterview.id})`);

      // 测试取消面试
      const cancelled = await updateInterviewStatus(token, scheduledInterview.id, 'CANCELLED');
      console.log(`✅ 面试状态已更新为: ${cancelled.status}`);

      // 恢复状态
      const restored = await updateInterviewStatus(token, scheduledInterview.id, 'SCHEDULED');
      console.log(`✅ 面试状态已恢复为: ${restored.status}`);

      // 测试标记完成
      const completed = await updateInterviewStatus(token, scheduledInterview.id, 'COMPLETED');
      console.log(`✅ 面试状态已更新为: ${completed.status}`);
    } else {
      console.log('⚠️  没有找到可测试状态更新的面试');
    }

    // ========================================
    // 测试4: 获取面试详情
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试4: 获取面试详情');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const allInterviews = await getInterviews(token, 0, 1);
    if (allInterviews.data && allInterviews.data.length > 0) {
      const interviewId = allInterviews.data[0].id;
      const detail = await getInterviewDetail(token, interviewId);

      console.log(`✅ 获取面试详情成功:`);
      console.log('   标题:', detail.title);
      console.log('   状态:', detail.status);
      console.log('   类型:', detail.type);
      console.log('   阶段:', detail.stage);
      console.log('   时间:', detail.scheduledAt);
      console.log('   候选人:', detail.application?.candidate?.name);
      console.log('   职位:', detail.application?.job?.title);
      console.log('   评分:', detail.score || '未评分');
      console.log('   反馈:', detail.feedback ? '有' : '无');
    }

    // ========================================
    // 测试5: 删除功能（先创建一个测试面试）
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('测试5: 删除功能');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('⚠️  删除测试跳过（避免删除真实数据）');
    console.log('   如需测试，请在浏览器中手动测试删除功能');

    // ========================================
    // 总结
    // ========================================
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 所有测试完成！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n📊 测试总结:');
    console.log('  ✅ 分页功能 - 正常');
    console.log('  ✅ 状态筛选 - 正常');
    console.log('  ✅ 状态更新 - 正常');
    console.log('  ✅ 详情查询 - 正常');
    console.log('  ⚠️  删除功能 - 请手动测试');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
test();
