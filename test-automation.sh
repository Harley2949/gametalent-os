#!/bin/bash

# 自动化规则引擎 - 快速测试脚本
# Bash/Git Bash 版本

set -e

# 配置
API_BASE_URL="http://localhost:3001"
APPLICATION_ID=""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# 步骤 1: 运行种子数据（首次运行）
# ============================================
echo -e "${CYAN}"
echo "========================================"
echo "步骤 1: 运行种子数据"
echo "========================================"
echo -e "${NC}"
echo -e "${YELLOW}在另一个终端运行以下命令:${NC}"
echo -e "${GREEN}cd C:/Users/admin/resume-analyzer/AI原生招聘系统-claude${NC}"
echo -e "${GREEN}pnpm --filter @gametalent/db seed${NC}"
echo ""

read -p "种子数据运行完成后按 Enter 继续 (或输入申请 ID): " input

if [ -n "$input" ]; then
    APPLICATION_ID="$input"
fi

# ============================================
# 步骤 2: 更新申请状态为 INTERVIEW_PASSED
# ============================================
echo ""
echo -e "${CYAN}"
echo "========================================"
echo "步骤 2: 更新申请状态"
echo "========================================"
echo -e "${NC}"

if [ -z "$APPLICATION_ID" ]; then
    read -p "请输入申请 ID: " APPLICATION_ID
fi

echo -e "${YELLOW}更新申请状态为 INTERVIEW_PASSED...${NC}"

update_url="$API_BASE_URL/api/applications/$APPLICATION_ID"

response=$(curl -s -w "\n%{http_code}" -X PUT "$update_url" \
  -H "Content-Type: application/json" \
  -d '{"status": "INTERVIEW_PASSED"}' 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ 状态更新成功！${NC}"
    # 解析新状态
    new_status=$(echo "$body" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    echo -e "  新状态: $new_status"
    echo ""
else
    echo -e "${RED}✗ 更新失败 (HTTP $http_code)${NC}"
    echo -e "${YELLOW}  可能原因: 后端服务未启动或需要认证${NC}"
    echo -e "${YELLOW}  尝试暂时注释掉 applications.controller.ts 中的 @UseGuards${NC}"
    echo ""
fi

# ============================================
# 步骤 3: 调用自动化规则检查接口
# ============================================
echo -e "${CYAN}"
echo "========================================"
echo "步骤 3: 触发自动化规则检查"
echo "========================================"
echo -e "${NC}"

echo -e "${YELLOW}调用自动化规则引擎...${NC}"

check_url="$API_BASE_URL/api/automation/check/$APPLICATION_ID"

response=$(curl -s -w "\n%{http_code}" -X POST "$check_url" \
  -H "Content-Type: application/json" 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ 规则检查完成！${NC}"

    # 解析 JSON（使用简单 grep）
    total_rules=$(echo "$body" | grep -o '"totalRules":[0-9]*' | cut -d':' -f2)
    matched=$(echo "$body" | grep -o '"rulesMatched":[0-9]*' | cut -d':' -f2)
    executed=$(echo "$body" | grep -o '"rulesExecuted":[0-9]*' | cut -d':' -f2)

    echo ""
    echo -e "${CYAN}结果摘要:${NC}"
    echo "  总规则数: $total_rules"
    echo "  匹配规则: $matched"
    echo "  执行规则: $executed"
    echo ""
else
    echo -e "${RED}✗ 规则检查失败 (HTTP $http_code)${NC}"
    echo "$body"
fi

# ============================================
# 步骤 4: 验证结果
# ============================================
echo -e "${CYAN}"
echo "========================================"
echo "步骤 4: 验证结果"
echo "========================================"
echo -e "${NC}"

echo -e "${YELLOW}获取申请详情...${NC}"

get_url="$API_BASE_URL/api/applications/$APPLICATION_ID"

response=$(curl -s -w "\n%{http_code}" -X GET "$get_url" \
  -H "Content-Type: application/json" 2>/dev/null)

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo -e "${GREEN}✓ 申请详情:${NC}"
    status=$(echo "$body" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 | head -n1)
    echo "  状态: $status"

    if [ "$status" = "OFFERED" ]; then
        echo ""
        echo -e "${GREEN}✨ 测试成功！申请状态已自动从 INTERVIEW_PASSED 更新为 OFFERED${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  状态未更新，当前为: $status${NC}"
        echo -e "${YELLOW}   确保已运行步骤 2 更新状态为 INTERVIEW_PASSED${NC}"
    fi
else
    echo -e "${RED}✗ 获取详情失败 (HTTP $http_code)${NC}"
fi

# ============================================
# 完成
# ============================================
echo ""
echo -e "${CYAN}"
echo "========================================"
echo "测试完成！"
echo "========================================"
echo -e "${NC}"
echo -e "${YELLOW}后续步骤:${NC}"
echo "  1. 查看 process_logs 表了解规则执行日志"
echo "  2. 运行 pnpm --filter @gametalent/db studio 使用 Prisma Studio"
echo "  3. 查看后端终端观察通知输出"
echo "  4. 继续开发任务 #15（权限管理体系）"
echo ""
