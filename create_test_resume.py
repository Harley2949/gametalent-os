# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors

# Create PDF
doc = SimpleDocTemplate("test-resume-game-dev.pdf", pagesize=A4)

# Container for the 'Flowable' objects
elements = []

# Define styles
styles = getSampleStyleSheet()

# Create custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=20,
    alignment=TA_CENTER,
    spaceAfter=12,
)

header_style = ParagraphStyle(
    'CustomHeader',
    parent=styles['Normal'],
    fontSize=14,
    alignment=TA_CENTER,
)

contact_style = ParagraphStyle(
    'CustomContact',
    parent=styles['Normal'],
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.gray,
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=14,
    textColor=colors.blue,
    spaceAfter=8,
    spaceBefore=12,
)

content_style = ParagraphStyle(
    'CustomContent',
    parent=styles['Normal'],
    fontSize=11,
    spaceAfter=6,
)

# Title and Header
elements.append(Paragraph("张伟", title_style))
elements.append(Paragraph("高级游戏开发工程师", header_style))
elements.append(Spacer(1, 0.1*inch))
elements.append(Paragraph("邮箱: zhangwei.gamedev@example.com | 电话: 138-8888-6666", contact_style))
elements.append(Paragraph("GitHub: github.com/zhangwei-gamedev", contact_style))
elements.append(Spacer(1, 0.2*inch))

# Summary
elements.append(Paragraph("个人简介", heading_style))
elements.append(Paragraph("拥有8年游戏开发经验的技术负责人，精通Unity和Unreal Engine。曾参与多款成功上线的大型MMORPG和手游项目，擅长客户端架构设计和性能优化。", content_style))
elements.append(Spacer(1, 0.1*inch))

# Skills
elements.append(Paragraph("专业技能", heading_style))
elements.append(Paragraph("<b>游戏引擎:</b> Unreal Engine 5 (专家), Unity 3D (精通), Cocos Creator (熟悉)", content_style))
elements.append(Paragraph("<b>编程语言:</b> C++ (专家), C# (精通), Lua (熟悉)", content_style))
elements.append(Paragraph("<b>图形/渲染:</b> HLSL/GLSL 着色器编程, PBR材质系统, 渲染管线优化", content_style))
elements.append(Spacer(1, 0.1*inch))

# Work Experience
elements.append(Paragraph("工作经历", heading_style))
elements.append(Paragraph("<b>腾讯游戏</b> - 高级客户端开发工程师 (2020.03 - 至今)", content_style))
elements.append(Paragraph("负责《天涯明月刀手游》核心战斗系统开发。主程负责战斗系统架构设计，带领5人团队。优化技能系统性能，帧率提升40%。", content_style))
elements.append(Spacer(1, 0.05*inch))

elements.append(Paragraph("<b>米哈游</b> - 游戏客户端开发 (2018.07 - 2020.02)", content_style))
elements.append(Paragraph("参与《原神》项目开发。负责角色技能系统实现，开发剧情对话系统，协助优化移动端性能。", content_style))
elements.append(Spacer(1, 0.05*inch))

elements.append(Paragraph("<b>网易游戏</b> - 初级游戏开发工程师 (2016.07 - 2018.06)", content_style))
elements.append(Paragraph("参与《楚留香》项目。实现任务系统和NPC AI，开发社交系统模块。", content_style))
elements.append(Spacer(1, 0.1*inch))

# Projects
elements.append(Paragraph("项目经验", heading_style))
elements.append(Paragraph("<b>《天涯明月刀手游》</b> - MMORPG，已上线，iOS/Android，月活跃500万+。角色: 核心战斗系统主程", content_style))
elements.append(Spacer(1, 0.05*inch))
elements.append(Paragraph("<b>《原神》</b> - 开放世界RPG，已上线，全球下载1亿+。角色: 客户端开发工程师", content_style))
elements.append(Spacer(1, 0.05*inch))
elements.append(Paragraph("<b>《楚留香》</b> - MMORPG，已上线。角色: 系统开发工程师", content_style))
elements.append(Spacer(1, 0.1*inch))

# Education
elements.append(Paragraph("教育背景", heading_style))
elements.append(Paragraph("<b>浙江大学</b> - 计算机科学与技术 | 本科 | 2012 - 2016", content_style))
elements.append(Paragraph("主修课程: 数据结构、算法设计、计算机图形学、游戏开发基础", content_style))
elements.append(Spacer(1, 0.1*inch))

# Game Preferences
elements.append(Paragraph("游戏偏好", heading_style))
elements.append(Paragraph("擅长品类: MMORPG、动作RPG、开放世界、卡牌", content_style))
elements.append(Paragraph("美术风格: 写实、二次元、国风", content_style))

# Build PDF
doc.build(elements)
print("PDF created successfully: test-resume-game-dev.pdf")
