// 通过HTTP API创建测试数据
const axios = require('axios');

const API_BASE = 'http://localhost:3006/api';

let authToken = '';

async function httpPost(url, data, needAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (needAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await axios.post(`${API_BASE}${url}`, data, { headers });
    return response.data;
  } catch (error) {
    console.error(`❌ 请求失败 ${url}:`, error.response?.data || error.message);
    throw error;
  }
}

async function httpGet(url, needAuth = true) {
  const headers = {};

  if (needAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await axios.get(`${API_BASE}${url}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`❌ 请求失败 ${url}:`, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 开始通过API创建测试数据...\n');

  try {
    // 1. 登录获取token
    console.log('1. 登录系统...');
    try {
      const loginResult = await httpPost('/auth/login', {
        email: 'admin@gametalent.os',
        password: 'admin123',
      }, false);
      authToken = loginResult.access_token;
      console.log('  ✓ 登录成功\n');
    } catch (error) {
      // 如果登录失败，先注册用户
      console.log('  用户不存在，先注册...');
      await httpPost('/auth/register', {
        email: 'admin@gametalent.os',
        password: 'admin123',
        name: '系统管理员',
        role: 'ADMIN',
      }, false);

      const loginResult = await httpPost('/auth/login', {
        email: 'admin@gametalent.os',
        password: 'admin123',
      }, false);
      authToken = loginResult.access_token;
      console.log('  ✓ 注册并登录成功\n');
    }

    // 2. 创建候选人
    console.log('2. 创建候选人...');
    const candidates = await Promise.all([
      httpPost('/candidates', {
        email: 'zhangwei@example.com',
        name: '张伟',
        phoneNumber: '13800138001',
        status: 'ACTIVE',
        source: 'LINKEDIN',
        location: '北京',
        currentCompany: '腾讯游戏',
        currentTitle: '高级客户端开发工程师',
        expectedSalary: '35-45K',
        noticePeriod: '1个月',
        yearsOfExperience: 8,
        tags: ['Unity3D', 'C++', '游戏开发', '客户端'],
        notes: '8年游戏开发经验，擅长客户端开发',
      }),
      httpPost('/candidates', {
        email: 'lina@example.com',
        name: '李娜',
        phoneNumber: '13800138002',
        status: 'ACTIVE',
        source: 'REFERRAL',
        location: '上海',
        currentCompany: '米哈游',
        currentTitle: 'UI设计师',
        expectedSalary: '25-35K',
        noticePeriod: '2周',
        yearsOfExperience: 5,
        tags: ['UI设计', 'Photoshop', 'Figma', '游戏美术'],
        notes: '5年UI设计经验，有多个成功项目',
      }),
      httpPost('/candidates', {
        email: 'wangqiang@example.com',
        name: '王强',
        phoneNumber: '13800138003',
        status: 'ACTIVE',
        source: 'DIRECT',
        location: '深圳',
        currentCompany: '网易游戏',
        currentTitle: '服务器开发工程师',
        expectedSalary: '40-50K',
        noticePeriod: '1个月',
        yearsOfExperience: 10,
        tags: ['C++', '服务器开发', '分布式系统', '网络编程'],
        notes: '10年服务器开发经验，技术扎实',
      }),
    ]);
    console.log('  ✓ 创建了3个候选人\n');

    // 3. 创建职位
    console.log('3. 创建职位...');
    const jobs = await Promise.all([
      httpPost('/jobs', {
        title: '高级游戏客户端开发工程师',
        description: '负责游戏客户端核心功能开发和性能优化',
        requirements: '5年以上游戏开发经验，精通C++/Unity，有完整项目经验',
        responsibilities: '负责游戏客户端开发和维护，参与架构设计',
        type: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 25000,
        salaryMax: 40000,
        salaryCurrency: 'CNY',
        location: '北京',
        department: '技术部',
        team: '客户端开发组',
        targetCompanies: ['腾讯游戏', '网易游戏', '米哈游'],
        targetSkills: ['C++', 'Unity3D', '游戏开发', '性能优化'],
      }),
      httpPost('/jobs', {
        title: '游戏UI设计师',
        description: '负责游戏UI界面设计和交互设计',
        requirements: '3年以上UI设计经验，精通Figma/Photoshop，有游戏项目经验',
        responsibilities: '负责游戏UI/UX设计，输出设计规范',
        type: 'FULL_TIME',
        workMode: 'HYBRID',
        experienceLevel: 'MID',
        priority: 'MEDIUM',
        salaryMin: 20000,
        salaryMax: 30000,
        salaryCurrency: 'CNY',
        location: '上海',
        remoteRegions: ['上海', '杭州'],
        department: '美术部',
        team: 'UI设计组',
        targetCompanies: ['米哈游', '莉莉丝', '叠纸'],
        targetSkills: ['UI设计', 'Figma', 'Photoshop', '游戏UI'],
      }),
      httpPost('/jobs', {
        title: '游戏服务器开发工程师',
        description: '负责游戏服务器端开发和架构设计',
        requirements: '5年以上服务器开发经验，精通C++/Go，熟悉分布式系统',
        responsibilities: '负责游戏服务器开发，性能优化，架构设计',
        type: 'FULL_TIME',
        workMode: 'ONSITE',
        experienceLevel: 'SENIOR',
        priority: 'HIGH',
        salaryMin: 30000,
        salaryMax: 50000,
        salaryCurrency: 'CNY',
        location: '深圳',
        department: '技术部',
        team: '服务器开发组',
        targetCompanies: ['腾讯游戏', '网易游戏'],
        targetSkills: ['C++', 'Go', '服务器开发', '分布式'],
      }),
    ]);
    console.log('  ✓ 创建了3个职位\n');

    // 4. 发布第一个职位
    console.log('4. 发布职位...');
    await httpPost(`/jobs/${jobs[0].id}/publish`, {});
    await httpPost(`/jobs/${jobs[1].id}/publish`, {});
    console.log('  ✓ 发布了2个职位\n');

    console.log('✅ 测试数据创建完成！\n');
    console.log('📊 数据统计：');
    console.log('  - 3个候选人');
    console.log('  - 3个职位（2个已发布）\n');

    console.log('📝 测试账号：');
    console.log('  admin@gametalent.os / admin123\n');

  } catch (error) {
    console.error('\n❌ 创建测试数据失败:', error.message);
    process.exit(1);
  }
}

main();
