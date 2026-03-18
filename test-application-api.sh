#!/bin/bash

echo "=== 测试应用程序 API ==="
echo ""

# 1. 首先尝试登录获取token
echo "1️⃣ 尝试登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3006/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gametalent.com","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"

# 检查是否成功获取token
if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  echo "✅ 成功获取token: ${TOKEN:0:20}..."
else
  echo "❌ 登录失败，尝试其他方法..."
  # 尝试使用测试用户
  LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3006/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}')
  echo "测试用户登录响应: $LOGIN_RESPONSE"

  if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo "✅ 成功获取token: ${TOKEN:0:20}..."
  else
    echo "❌ 无法获取token，退出测试"
    exit 1
  fi
fi

echo ""
echo "2️⃣ 获取候选人列表..."
CANDIDATES=$(curl -s -X GET "http://localhost:3006/api/candidates?skip=0&take=1" \
  -H "Authorization: Bearer $TOKEN")
echo "$CANDIDATES" | head -100
CANDIDATE_ID=$(echo "$CANDIDATES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "候选人ID: $CANDIDATE_ID"

echo ""
echo "3️⃣ 获取职位列表..."
JOBS=$(curl -s -X GET "http://localhost:3006/api/jobs?skip=0&take=1" \
  -H "Authorization: Bearer $TOKEN")
echo "$JOBS" | head -100
JOB_ID=$(echo "$JOBS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "职位ID: $JOB_ID"

echo ""
echo "4️⃣ 创建应聘记录..."
CREATE_DATA=$(cat <<EOF
{
  "jobId": "$JOB_ID",
  "candidateId": "$CANDIDATE_ID",
  "source": "DIRECT",
  "transparencyLevel": "STANDARD"
}
EOF
)

echo "发送数据: $CREATE_DATA"

APPLICATION_RESPONSE=$(curl -s -X POST "http://localhost:3006/api/applications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CREATE_DATA")

echo "创建响应: $APPLICATION_RESPONSE"

if echo "$APPLICATION_RESPONSE" | grep -q "id"; then
  echo "✅ 成功创建应聘记录！"
else
  echo "❌ 创建失败"
fi
