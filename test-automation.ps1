# 自动化规则引擎 - 快速测试脚本
# Windows PowerShell 版本

# 配置
$API_BASE_URL = "http://localhost:3001"
$APPLICATION_ID = ""  # 运行种子数据后，在这里填入你的申请 ID

# ============================================
# 步骤 1: 运行种子数据（首次运行）
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "步骤 1: 运行种子数据" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "在另一个终端运行以下命令：" -ForegroundColor Yellow
Write-Host "cd C:\Users\admin\resume-analyzer\AI原生招聘系统-claude" -ForegroundColor White
Write-Host "pnpm --filter @gametalent/db seed`n" -ForegroundColor Green

# 暂停等待用户运行种子数据
$continue = Read-Host "种子数据运行完成后按 Enter 继续 (或先输入申请 ID: $APPLICATION_ID)"

if ($continue -ne "") {
    $APPLICATION_ID = $continue
}

# ============================================
# 步骤 2: 更新申请状态为 INTERVIEW_PASSED
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "步骤 2: 更新申请状态" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($APPLICATION_ID -eq "") {
    $APPLICATION_ID = Read-Host "请输入申请 ID"
}

Write-Host "更新申请状态为 INTERVIEW_PASSED..." -ForegroundColor Yellow

try {
    $headers = @{
        "Content-Type" = "application/json"
    }

    $body = @{
        status = "INTERVIEW_PASSED"
    } | ConvertTo-Json

    $updateUrl = "$API_BASE_URL/api/applications/$APPLICATION_ID"
    $result = Invoke-RestMethod -Uri $updateUrl -Method PUT -Headers $headers -Body $body

    Write-Host "✓ 状态更新成功！" -ForegroundColor Green
    Write-Host "  新状态: $($result.status)`n" -ForegroundColor White
} catch {
    Write-Host "✗ 更新失败: $_" -ForegroundColor Red
    Write-Host "  可能原因: 后端服务未启动或需要认证" -ForegroundColor Yellow
    Write-Host "  尝试暂时注释掉 applications.controller.ts 中的 @UseGuards`n" -ForegroundColor Yellow
}

# ============================================
# 步骤 3: 调用自动化规则检查接口
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "步骤 3: 触发自动化规则检查" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "调用自动化规则引擎..." -ForegroundColor Yellow

try {
    $checkUrl = "$API_BASE_URL/api/automation/check/$APPLICATION_ID"
    $result = Invoke-RestMethod -Uri $checkUrl -Method POST -Headers $headers

    Write-Host "✓ 规则检查完成！" -ForegroundColor Green
    Write-Host "`n结果摘要:" -ForegroundColor Cyan
    Write-Host "  总规则数: $($result.totalRules)" -ForegroundColor White
    Write-Host "  匹配规则: $($result.rulesMatched)" -ForegroundColor White
    Write-Host "  执行规则: $($result.rulesExecuted)" -ForegroundColor White

    if ($result.details -and $result.details.Count -gt 0) {
        Write-Host "`n执行详情:" -ForegroundColor Cyan
        foreach ($detail in $result.details) {
            if ($detail.executed) {
                Write-Host "  ✓ [$($detail.ruleName)]" -ForegroundColor Green
                Write-Host "    触发: 是, 执行: 成功" -ForegroundColor White
                Write-Host "    动作数: $($detail.actions.Count)" -ForegroundColor White

                foreach ($action in $detail.actions) {
                    $icon = if ($action.success) { "✓" } else { "✗" }
                    $color = if ($action.success) { "Green" } else { "Red" }
                    Write-Host "      $icon [$($action.type)] $($action.message)" -ForegroundColor $color
                }
            } else {
                Write-Host "  ✗ [$($detail.ruleName)]" -ForegroundColor Yellow
                Write-Host "    $($detail.message)" -ForegroundColor Gray
            }
        }
    }

    Write-Host "`n💡 查看后端终端以观察通知输出（console.log）`n" -ForegroundColor Yellow
} catch {
    Write-Host "✗ 规则检查失败: $_" -ForegroundColor Red
}

# ============================================
# 步骤 4: 验证结果
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "步骤 4: 验证结果" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "获取申请详情..." -ForegroundColor Yellow

try {
    $getUrl = "$API_BASE_URL/api/applications/$APPLICATION_ID"
    $result = Invoke-RestMethod -Uri $getUrl -Method GET -Headers $headers

    Write-Host "✓ 申请详情:" -ForegroundColor Green
    Write-Host "  状态: $($result.status)" -ForegroundColor Cyan
    Write-Host "  候选人 ID: $($result.candidateId)" -ForegroundColor White
    Write-Host "  职位 ID: $($result.jobId)" -ForegroundColor White
    Write-Host "  匹配分数: $($result.matchScore)" -ForegroundColor White

    if ($result.status -eq "OFFERED") {
        Write-Host "`n✨ 测试成功！申请状态已自动从 INTERVIEW_PASSED 更新为 OFFERED" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  状态未更新，当前为: $($result.status)" -ForegroundColor Yellow
        Write-Host "   确保已运行步骤 2 更新状态为 INTERVIEW_PASSED" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 获取详情失败: $_" -ForegroundColor Red
}

# ============================================
# 完成
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "后续步骤:" -ForegroundColor Yellow
Write-Host "  1. 查看 process_logs 表了解规则执行日志" -ForegroundColor White
Write-Host "  2. 运行 pnpm --filter @gametalent/db studio 使用 Prisma Studio" -ForegroundColor White
Write-Host "  3. 查看后端终端观察通知输出" -ForegroundColor White
Write-Host "  4. 继续开发任务 #15（权限管理体系）`n" -ForegroundColor White
