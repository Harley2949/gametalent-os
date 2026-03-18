@echo off
setlocal enabledelayedexpansion

set API_BASE=http://localhost:3006/api
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1rZXJheW8wMDAwMTE4Y3lteWMwaDZ2IiwiZW1haWwiOiJhZG1pbkBnYW1ldGFsZW50Lm9zIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzczMTM0OTMzLCJleHAiOjE3NzM3Mzk3MzN9.NP1HKJ-ClV2fQ9SySFAX9gA_Db8iG9lK3w9iRNHGX-4

echo 正在创建测试数据...
echo.

echo [1/3] 创建候选人...
curl -X POST %API_BASE%/candidates ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"zhangwei@example.com\",\"name\":\"张伟\",\"phoneNumber\":\"13800138001\",\"status\":\"ACTIVE\",\"source\":\"LINKEDIN\",\"location\":\"北京\",\"currentCompany\":\"腾讯游戏\",\"currentTitle\":\"高级客户端开发工程师\",\"expectedSalary\":\"35-45K\",\"noticePeriod\":\"1个月\",\"yearsOfExperience\":8,\"tags\":[\"Unity3D\",\"C++\",\"游戏开发\"],\"notes\":\"8年游戏开发经验\"}"

curl -X POST %API_BASE%/candidates ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"lina@example.com\",\"name\":\"李娜\",\"phoneNumber\":\"13800138002\",\"status\":\"ACTIVE\",\"source\":\"REFERRAL\",\"location\":\"上海\",\"currentCompany\":\"米哈游\",\"currentTitle\":\"UI设计师\",\"expectedSalary\":\"25-35K\",\"noticePeriod\":\"2周\",\"yearsOfExperience\":5,\"tags\":[\"UI设计\",\"Figma\"],\"notes\":\"5年UI设计经验\"}"

curl -X POST %API_BASE%/candidates ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"wangqiang@example.com\",\"name\":\"王强\",\"phoneNumber\":\"13800138003\",\"status\":\"ACTIVE\",\"source\":\"DIRECT\",\"location\":\"深圳\",\"currentCompany\":\"网易游戏\",\"currentTitle\":\"服务器开发工程师\",\"expectedSalary\":\"40-50K\",\"noticePeriod\":\"1个月\",\"yearsOfExperience\":10,\"tags\":[\"C++\",\"服务器开发\"],\"notes\":\"10年服务器开发经验\"}"

echo.
echo [2/3] 创建职位...

set JOB1_OUTPUT=curl -X POST %API_BASE%/jobs -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"title\":\"高级游戏客户端开发工程师\",\"description\":\"负责游戏客户端核心功能开发和性能优化\",\"requirements\":\"5年以上游戏开发经验\",\"responsibilities\":\"负责游戏客户端开发和维护\",\"type\":\"FULL_TIME\",\"workMode\":\"ONSITE\",\"experienceLevel\":\"SENIOR\",\"priority\":\"HIGH\",\"salaryMin\":25000,\"salaryMax\":40000,\"location\":\"北京\",\"department\":\"技术部\",\"targetCompanies\":[\"腾讯游戏\",\"网易游戏\"],\"targetSkills\":[\"C++\",\"Unity3D\"]}"

set JOB2_OUTPUT=curl -X POST %API_BASE%/jobs -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" -d "{\"title\":\"游戏UI设计师\",\"description\":\"负责游戏UI界面设计\",\"requirements\":\"3年以上UI设计经验\",\"responsibilities\":\"负责游戏UI/UX设计\",\"type\":\"FULL_TIME\",\"workMode\":\"HYBRID\",\"experienceLevel\":\"MID\",\"priority\":\"MEDIUM\",\"salaryMin\":20000,\"salaryMax\":30000,\"location\":\"上海\",\"department\":\"美术部\",\"targetCompanies\":[\"米哈游\"],\"targetSkills\":[\"UI设计\",\"Figma\"]}"

echo.
echo [3/3] 发布职位...
echo 职位创建后，请访问前端页面进行发布操作

echo.
echo ✅ 测试数据创建完成！
echo.
echo 📝 测试账号:
echo    admin@gametalent.os / admin123
echo.
echo 🌐 访问地址:
echo    前端: http://localhost:3002
echo    后端API: http://localhost:3006/api/docs
echo.
pause
