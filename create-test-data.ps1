# 测试数据创建脚本
$API_BASE = "http://localhost:3006/api"

Write-Host "🚀 开始创建测试数据..." -ForegroundColor Green

# 1. 注册/登录管理员
Write-Host "`n1. 创建管理员账户..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@gametalent.os"
    password = "admin123"
    name = "系统管理员"
    role = "ADMIN"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "  ✓ 管理员账户创建成功" -ForegroundColor Green
} catch {
    Write-Host "  ℹ 管理员账户已存在，尝试登录..." -ForegroundColor Yellow
}

# 登录获取token
$loginBody = @{
    email = "admin@gametalent.os"
    password = "admin123"
} | ConvertTo-Json

$authResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $authResponse.access_token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "  ✓ 登录成功`n" -ForegroundColor Green

# 2. 创建候选人
Write-Host "2. 创建候选人..." -ForegroundColor Cyan

$candidate1 = @{
    email = "zhangwei@example.com"
    name = "张伟"
    phoneNumber = "13800138001"
    status = "ACTIVE"
    source = "LINKEDIN"
    location = "北京"
    currentCompany = "腾讯游戏"
    currentTitle = "高级客户端开发工程师"
    expectedSalary = "35-45K"
    noticePeriod = "1个月"
    yearsOfExperience = 8
    tags = @("Unity3D", "C++", "游戏开发", "客户端")
    notes = "8年游戏开发经验，擅长客户端开发"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_BASE/candidates" -Method POST -Body $candidate1 -Headers $headers | Out-Null
Write-Host "  ✓ 创建候选人：张伟" -ForegroundColor Green

$candidate2 = @{
    email = "lina@example.com"
    name = "李娜"
    phoneNumber = "13800138002"
    status = "ACTIVE"
    source = "REFERRAL"
    location = "上海"
    currentCompany = "米哈游"
    currentTitle = "UI设计师"
    expectedSalary = "25-35K"
    noticePeriod = "2周"
    yearsOfExperience = 5
    tags = @("UI设计", "Photoshop", "Figma", "游戏美术")
    notes = "5年UI设计经验，有多个成功项目"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_BASE/candidates" -Method POST -Body $candidate2 -Headers $headers | Out-Null
Write-Host "  ✓ 创建候选人：李娜" -ForegroundColor Green

$candidate3 = @{
    email = "wangqiang@example.com"
    name = "王强"
    phoneNumber = "13800138003"
    status = "ACTIVE"
    source = "DIRECT"
    location = "深圳"
    currentCompany = "网易游戏"
    currentTitle = "服务器开发工程师"
    expectedSalary = "40-50K"
    noticePeriod = "1个月"
    yearsOfExperience = 10
    tags = @("C++", "服务器开发", "分布式系统", "网络编程")
    notes = "10年服务器开发经验，技术扎实"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_BASE/candidates" -Method POST -Body $candidate3 -Headers $headers | Out-Null
Write-Host "  ✓ 创建候选人：王强`n" -ForegroundColor Green

# 3. 创建职位
Write-Host "3. 创建职位..." -ForegroundColor Cyan

$job1 = @{
    title = "高级游戏客户端开发工程师"
    description = "负责游戏客户端核心功能开发和性能优化"
    requirements = "5年以上游戏开发经验，精通C++/Unity，有完整项目经验"
    responsibilities = "负责游戏客户端开发和维护，参与架构设计"
    type = "FULL_TIME"
    workMode = "ONSITE"
    experienceLevel = "SENIOR"
    priority = "HIGH"
    salaryMin = 25000
    salaryMax = 40000
    salaryCurrency = "CNY"
    location = "北京"
    department = "技术部"
    team = "客户端开发组"
    targetCompanies = @("腾讯游戏", "网易游戏", "米哈游")
    targetSkills = @("C++", "Unity3D", "游戏开发", "性能优化")
} | ConvertTo-Json

$job1Response = Invoke-RestMethod -Uri "$API_BASE/jobs" -Method POST -Body $job1 -Headers $headers
Write-Host "  ✓ 创建职位：高级游戏客户端开发工程师" -ForegroundColor Green

$job2 = @{
    title = "游戏UI设计师"
    description = "负责游戏UI界面设计和交互设计"
    requirements = "3年以上UI设计经验，精通Figma/Photoshop，有游戏项目经验"
    responsibilities = "负责游戏UI/UX设计，输出设计规范"
    type = "FULL_TIME"
    workMode = "HYBRID"
    experienceLevel = "MID"
    priority = "MEDIUM"
    salaryMin = 20000
    salaryMax = 30000
    salaryCurrency = "CNY"
    location = "上海"
    remoteRegions = @("上海", "杭州")
    department = "美术部"
    team = "UI设计组"
    targetCompanies = @("米哈游", "莉莉丝", "叠纸")
    targetSkills = @("UI设计", "Figma", "Photoshop", "游戏UI")
} | ConvertTo-Json

$job2Response = Invoke-RestMethod -Uri "$API_BASE/jobs" -Method POST -Body $job2 -Headers $headers
Write-Host "  ✓ 创建职位：游戏UI设计师" -ForegroundColor Green

$job3 = @{
    title = "游戏服务器开发工程师"
    description = "负责游戏服务器端开发和架构设计"
    requirements = "5年以上服务器开发经验，精通C++/Go，熟悉分布式系统"
    responsibilities = "负责游戏服务器开发，性能优化，架构设计"
    type = "FULL_TIME"
    workMode = "ONSITE"
    experienceLevel = "SENIOR"
    priority = "HIGH"
    salaryMin = 30000
    salaryMax = 50000
    salaryCurrency = "CNY"
    location = "深圳"
    department = "技术部"
    team = "服务器开发组"
    targetCompanies = @("腾讯游戏", "网易游戏")
    targetSkills = @("C++", "Go", "服务器开发", "分布式")
} | ConvertTo-Json

$job3Response = Invoke-RestMethod -Uri "$API_BASE/jobs" -Method POST -Body $job3 -Headers $headers
Write-Host "  ✓ 创建职位：游戏服务器开发工程师`n" -ForegroundColor Green

# 4. 发布职位
Write-Host "4. 发布职位..." -ForegroundColor Cyan

Invoke-RestMethod -Uri "$API_BASE/jobs/$($job1Response.id)/publish" -Method POST -Headers $headers | Out-Null
Write-Host "  ✓ 发布职位：高级游戏客户端开发工程师" -ForegroundColor Green

Invoke-RestMethod -Uri "$API_BASE/jobs/$($job2Response.id)/publish" -Method POST -Headers $headers | Out-Null
Write-Host "  ✓ 发布职位：游戏UI设计师`n" -ForegroundColor Green

# 完成
Write-Host "✅ 测试数据创建完成！`n" -ForegroundColor Green
Write-Host "📊 数据统计：" -ForegroundColor Cyan
Write-Host "  - 3个候选人"
Write-Host "  - 3个职位（2个已发布）`n"

Write-Host "📝 测试账号：" -ForegroundColor Cyan
Write-Host "  邮箱：admin@gametalent.os"
Write-Host "  密码：admin123`n"

Write-Host "🌐 访问地址：" -ForegroundColor Cyan
Write-Host "  前端：http://localhost:3002"
Write-Host "  后端API：http://localhost:3006/api/docs`n"
