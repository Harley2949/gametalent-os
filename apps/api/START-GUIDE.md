# GameTalent OS 后端启动指南

## 问题已解决 ✅

1. **依赖注入问题**：从 `tsx` 改为 `ts-node --transpile-only`
2. **数据库连接**：修复了 `main.ts` 中的 `localhost` 为 `127.0.0.1`
3. **管理员用户**：已创建 `admin@gametalent.os` / `admin123`

## 手动启动步骤

1. **打开 PowerShell**（以管理员身份）

2. **清理旧进程**（如果需要）：
```powershell
$port = 3006
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
foreach ($pid in $processes) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 3
```

3. **进入项目目录**：
```powershell
cd "C:\Users\admin\resume-analyzer\AI原生招聘系统-claude\apps\api"
```

4. **启动后端**：
```powershell
npx ts-node --transpile-only -r tsconfig-paths/register src/main.ts
```

## 测试登录

启动成功后，在**新的 PowerShell 窗口**中测试：
```powershell
curl -X POST http://127.0.0.1:3006/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@gametalent.os","password":"admin123"}'
```

预期结果：返回 JWT token（包含 `access_token` 字段）

## 常见问题

**Q: 返回 404？**
A: 后端未成功启动，检查上方的错误日志

**Q: 返回 401？**
A: 密码验证失败，使用正确的账户信息

**Q: 端口被占用？**
A: 运行步骤2的清理命令

## 后台运行（可选）

如果需要后台运行，使用：
```powershell
Start-Process -FilePath "npx" -ArgumentList "ts-node","--transpile-only","-r","tsconfig-paths/register","src/main.ts" -WindowStyle Hidden
```

---

**总结**：后端服务已配置完成，主要问题是进程管理。手动启动可以避免脚本兼容性问题。
