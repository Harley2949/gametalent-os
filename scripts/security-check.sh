#!/bin/bash

# GameTalent OS - 安全检查脚本
#
# 在 Git commit 前运行，防止意外提交敏感信息
#
# 使用方法:
#   ./scripts/security-check.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印错误
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 打印成功
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 打印警告
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 敏感文件模式
SENSITIVE_FILES=(
    ".env$"
    ".env.local$"
    ".env.development.local$"
    ".env.test.local$"
    ".env.production.local$"
    "*.pem$"
    "*.key$"
    "secrets/"
)

# 敏感内容模式
SENSITIVE_PATTERNS=(
    "JWT_SECRET\s*=\s*[^\\s]{10,}"
    "DATABASE_PASSWORD\s*=\s*[^\\s]{8,}"
    "API_KEY\s*=\s*[^\\s]{10,}"
    "API_SECRET\s*=\s*[^\\s]{10,}"
    "SMTP_PASS\s*=\s*[^\\s]{8,}"
    "AWS_SECRET_ACCESS_KEY\s*=\s*[^\\s]{10,}"
    "password\s*=\s*[\"']?[^\s\"']{8,}"
)

echo ""
echo "🔒 GameTalent OS - 安全检查"
echo "========================================"

# 1. 检查暂存区中的敏感文件
echo ""
echo "检查暂存区中的敏感文件..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
HAS_VIOLATIONS=false

for pattern in "${SENSITIVE_FILES[@]}"; do
    if echo "$STAGED_FILES" | grep -E "$pattern" > /dev/null; then
        print_error "检测到敏感文件: $pattern"
        HAS_VIOLATIONS=true
    fi
done

if [ "$HAS_VIOLATIONS" = false ]; then
    print_success "未检测到敏感文件"
fi

# 2. 检查暂存区中的敏感内容
echo ""
echo "检查暂存区中的敏感内容..."

HAS_CONTENT_VIOLATIONS=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    # 检查暂存的文件内容
    if git diff --cached | grep -iE "$pattern" > /dev/null; then
        print_warning "可能包含敏感内容模式: $pattern"
        print_warning "请确认这不是真实的密钥或密码"
        HAS_CONTENT_VIOLATIONS=true
    fi
done

if [ "$HAS_CONTENT_VIOLATIONS" = false ]; then
    print_success "未检测到明显的敏感内容"
fi

# 3. 检查工作区中的未跟踪敏感文件
echo ""
echo "检查未跟踪的敏感文件..."

UNTRACKED_FILES=$(git ls-files --others --exclude-standard)

for pattern in "${SENSITIVE_FILES[@]}"; do
    if echo "$UNTRACKED_FILES" | grep -E "$pattern" > /dev/null; then
        print_warning "未跟踪的敏感文件: $pattern"
        print_warning "建议添加到 .gitignore"
    fi
done

# 4. 检查 .gitignore 配置
echo ""
echo "检查 .gitignore 配置..."

if ! grep -q "^\.env$" .gitignore; then
    print_warning ".gitignore 中缺少 .env 规则"
else
    print_success ".gitignore 配置正确"
fi

# 5. 总结
echo ""
echo "========================================"

if [ "$HAS_VIOLATIONS" = true ]; then
    print_error "安全检查失败！"
    echo ""
    echo "请执行以下操作："
    echo "1. 将敏感文件从暂存区移除: git reset HEAD <file>"
    echo "2. 将敏感文件添加到 .gitignore"
    echo "3. 确认不会泄露敏感信息"
    echo ""
    exit 1
fi

if [ "$HAS_CONTENT_VIOLATIONS" = true ]; then
    print_warning "发现潜在的敏感内容"
    echo ""
    echo "如果这些是测试数据或示例值，可以安全提交。"
    echo "如果是真实的密钥或密码，请立即修复。"
    echo ""
    read -p "是否继续提交? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "提交已取消"
        exit 1
    fi
fi

print_success "安全检查通过！"
echo ""
