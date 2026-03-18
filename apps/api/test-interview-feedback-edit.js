/**
 * 测试面试反馈编辑功能
 * 运行方式: node test-interview-feedback-edit.js
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
async function getInterviews(token) {
  const response = await fetch(`${API_BASE}/api/interviews`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('获取面试列表失败');
  }

  return response.json();
}

// 更新面试反馈
async function updateFeedback(token, interviewId, feedbackData) {
  console.log(`\n📝 正在更新面试 ${interviewId} 的反馈...`);
  console.log('反馈数据:', JSON.stringify(feedbackData, null, 2));

  const response = await fetch(`${API_BASE}/api/interviews/${interviewId}/feedback`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(feedbackData)
  });

  const responseText = await response.text();
  console.log('响应状态:', response.status);
  console.log('响应内容:', responseText);

  if (!response.ok) {
    throw new Error(`更新反馈失败: ${responseText}`);
  }

  return JSON.parse(responseText);
}

// 主测试函数
async function test() {
  try {
    console.log('🔐 正在登录...');
    const token = await login();
    console.log('✅ 登录成功');

    console.log('\n📋 获取面试列表...');
    const interviews = await getInterviews(token);
    console.log(`✅ 找到 ${interviews.data?.length || 0} 个面试`);

    if (!interviews.data || interviews.data.length === 0) {
      console.log('⚠️  没有可用的面试记录');
      return;
    }

    // 选择第一个已完成或有反馈的面试
    const interview = interviews.data.find(i => i.status === 'COMPLETED' || i.feedback) || interviews.data[0];
    console.log(`\n🎯 选择面试: ${interview.title} (ID: ${interview.id})`);
    console.log('当前状态:', interview.status);
    console.log('当前反馈:', interview.feedback);

    // 测试更新反馈
    const testFeedback = {
      score: 5,
      pros: '技术能力非常强，对游戏开发有深入理解',
      cons: '需要在团队沟通方面继续提升',
      notes: '这是通过API编辑的测试反馈',
      tags: ['技术过硬', '潜力巨大', '沟通待提升']
    };

    const updatedInterview = await updateFeedback(token, interview.id, testFeedback);

    console.log('\n✅ 反馈更新成功！');
    console.log('更新后的数据:', {
      score: updatedInterview.score,
      feedback: updatedInterview.feedback,
      notes: updatedInterview.notes
    });

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
test();
