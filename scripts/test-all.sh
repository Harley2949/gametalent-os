#!/bin/bash

# GameTalent OS - 全量测试脚本
#
# 运行所有测试并生成报告
#
# 使用方法:
#   ./scripts/test-all.sh              # 运行所有测试
#   ./scripts/test-all.sh --coverage   # 生成覆盖率报告
#   ./scripts/test-all.sh --watch      # 监听模式

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${BLUE}${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# 解析命令行参数
COVERAGE=false
WATCH=false
E2E=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage)
            COVERAGE=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --e2e)
            E2E=true
            shift
            ;;
        --help)
            echo "使用方法: ./scripts/test-all.sh [选项]"
            echo ""
            echo "选项:"
            echo "  --coverage    生成覆盖率报告"
            echo "  --watch       监听模式（仅单元测试）"
            echo "  --e2e         包含 E2E 测试"
            echo "  --help        显示帮助信息"
            exit 0
            ;;
        *)
            print_error "未知选项: $1"
            exit 1
            ;;
    esac
done

print_message "🧪 GameTalent OS - 测试套件"
echo ""

# 1. 后端测试
print_message "📦 运行后端测试..."
if [ "$WATCH" = true ]; then
    cd apps/api && npm run test:watch
elif [ "$COVERAGE" = true ]; then
    cd apps/api && npm run test:cov
    print_success "后端测试完成，覆盖率报告已生成"
else
    cd apps/api && npm run test
    print_success "后端测试通过"
fi
cd ../..

echo ""

# 2. 前端测试
print_message "🎨 运行前端测试..."
if [ "$WATCH" = true ]; then
    cd apps/web && npm run test:watch
elif [ "$COVERAGE" = true ]; then
    cd apps/web && npm run test:coverage
    print_success "前端测试完成，覆盖率报告已生成"
else
    cd apps/web && npm run test
    print_success "前端测试通过"
fi
cd ../..

echo ""

# 3. E2E 测试（可选）
if [ "$E2E" = true ] || [ "$COVERAGE" = true ]; then
    print_message "🌐 运行 E2E 测试..."
    if [ "$WATCH" = true ]; then
        npx playwright test --ui
    else
        npx playwright test
        print_success "E2E 测试通过"
    fi
    echo ""
fi

# 4. 生成汇总报告
if [ "$COVERAGE" = true ]; then
    print_message "📊 生成测试报告..."
    echo ""
    echo "后端覆盖率: apps/api/coverage/index.html"
    echo "前端覆盖率: apps/web/coverage/index.html"
    echo "E2E 报告: playwright-report/index.html"
    echo ""
fi

print_success "🎉 所有测试通过！"
