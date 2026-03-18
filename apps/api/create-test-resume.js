const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument();

// Pipe its output somewhere
doc.pipe(fs.createWriteStream('../test-resume-game-dev.pdf'));

// Add a font
doc.font('Helvetica');

// Header
doc.fontSize(24).text('张伟', { align: 'center' });
doc.fontSize(14).text('高级游戏开发工程师', { align: 'center' });
doc.moveDown();
doc.fontSize(11)
   .text('邮箱: zhangwei.gamedev@example.com', { align: 'center' })
   .text('电话: 138-8888-6666', { align: 'center' })
   .text('GitHub: github.com/zhangwei-gamedev', { align: 'center' })
   .text('作品集: artstation.com/zhangwei', { align: 'center' });

doc.moveDown();

// Summary
doc.fontSize(14).fillColor('blue').text('个人简介');
doc.fillColor('black').fontSize(11);
doc.text('拥有8年游戏开发经验的技术负责人，精通Unity和Unreal Engine。曾参与多款成功上线的大型MMORPG和手游项目，擅长客户端架构设计和性能优化。热爱游戏行业，对游戏玩法机制和用户体验有深入理解。');

doc.moveDown();

// Skills
doc.fontSize(14).fillColor('blue').text('专业技能');
doc.fillColor('black').fontSize(11);
doc.text('游戏引擎:');
doc.text('  - Unreal Engine 5 (专家)');
doc.text('  - Unity 3D (精通)');
doc.text('  - Cocos Creator (熟悉)');

doc.moveDown(0.3);
doc.text('编程语言:');
doc.text('  - C++ (专家)');
doc.text('  - C# (精通)');
doc.text('  - Lua (熟悉)');
doc.text('  - Python (了解)');

doc.moveDown(0.3);
doc.text('图形/渲染:');
doc.text('  - HLSL/GLSL 着色器编程');
doc.text('  - PBR材质系统');
doc.text('  - 渲染管线优化');

doc.moveDown();

// Work Experience
doc.fontSize(14).fillColor('blue').text('工作经历');
doc.fillColor('black').fontSize(11);

doc.text('腾讯游戏 | 高级客户端开发工程师', { bold: true });
doc.fontSize(10).fillColor('gray').text('2020年3月 - 至今 | 深圳');
doc.fillColor('black').fontSize(11);
doc.text('负责《天涯明月刀手游》核心战斗系统开发：');
doc.text('  • 主程负责战斗系统架构设计，带领5人团队');
doc.text('  • 优化技能系统性能，帧率提升40%');
doc.text('  • 实现PVP匹配系统和排行榜功能');

doc.moveDown(0.5);

doc.fontSize(11).fillColor('black').text('米哈游 | 游戏客户端开发', { bold: true });
doc.fontSize(10).fillColor('gray').text('2018年7月 - 2020年2月 | 上海');
doc.fillColor('black').fontSize(11);
doc.text('参与《原神》项目开发：');
doc.text('  • 负责角色技能系统实现');
doc.text('  • 开发剧情对话系统');
doc.text('  • 协助优化移动端性能');

doc.moveDown(0.5);

doc.fontSize(11).fillColor('black').text('网易游戏 | 初级游戏开发工程师', { bold: true });
doc.fontSize(10).fillColor('gray').text('2016年7月 - 2018年6月 | 广州');
doc.fillColor('black').fontSize(11);
doc.text('参与《楚留香》项目：');
doc.text('  • 实现任务系统和NPC AI');
doc.text('  • 开发社交系统模块');

doc.moveDown();

// Project Experience
doc.fontSize(14).fillColor('blue').text('项目经验');
doc.fillColor('black').fontSize(11);

doc.text('《天涯明月刀手游》', { bold: true });
doc.text('类型: MMORPG | 状态: 已上线 | 平台: iOS/Android');
doc.text('角色: 核心战斗系统主程');
doc.text('月活跃用户: 500万+');

doc.moveDown(0.3);

doc.text('《原神》', { bold: true });
doc.text('类型: 开放世界RPG | 状态: 已上线 | 平台: PC/移动端/主机');
doc.text('角色: 客户端开发工程师');
doc.text('全球下载量: 1亿+');

doc.moveDown(0.3);

doc.text('《楚留香》', { bold: true });
doc.text('类型: MMORPG | 状态: 已上线 | 平台: iOS/Android');
doc.text('角色: 系统开发工程师');

doc.moveDown();

// Education
doc.fontSize(14).fillColor('blue').text('教育背景');
doc.fillColor('black').fontSize(11);

doc.text('浙江大学', { bold: true });
doc.text('计算机科学与技术 | 本科 | 2012 - 2016');
doc.text('主修课程: 数据结构、算法设计、计算机图形学、游戏开发基础');
doc.text('毕业设计: 基于Unity的3D动作游戏原型');

doc.moveDown();

// Game Genres
doc.fontSize(14).fillColor('blue').text('游戏偏好');
doc.fillColor('black').fontSize(11);
doc.text('擅长品类: MMORPG、动作RPG、开放世界、卡牌');
doc.text('美术风格: 写实、二次元、国风');

doc.moveDown();

doc.end();
