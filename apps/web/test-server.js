const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>测试服务器工作正常！</h1><p>如果你看到这个页面，说明 Node.js HTTP 服务器可以正常运行。</p>');
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});
