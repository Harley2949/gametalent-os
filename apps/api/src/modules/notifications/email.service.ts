import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * 邮件服务
 * 使用 Nodemailer 发送邮件
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  private initializeTransporter() {
    if (!this.configService) {
      this.logger.warn('ConfigService not available. Email sending will be disabled.');
      return;
    }

    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!user || !pass) {
      this.logger.warn('SMTP credentials not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465 (SSL), false for other ports (TLS)
      auth: {
        user,
        pass,
      },
      // TLS 选项（用于非 465 端口或需要额外配置的情况）
      tls: {
        // 不验证证书（仅用于开发环境）
        rejectUnauthorized: false,
      },
    });

    // 验证配置
    this.transporter
      .verify()
      .then(() => {
        this.logger.log('SMTP server connection established');
      })
      .catch((error) => {
        this.logger.error('SMTP connection failed:', error);
      });
  }

  /**
   * 发送邮件
   */
  async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email send.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"GameTalent OS" <${this.configService.get<string>('SMTP_USER')}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * 发送面试邀请邮件
   */
  async sendInterviewInvite(data: {
    candidateEmail: string;
    candidateName: string;
    interviewerName: string;
    jobTitle: string;
    interviewTitle: string;
    scheduledAt: Date;
    duration: number;
    location?: string;
  }): Promise<boolean> {
    const { candidateEmail, candidateName, interviewerName, jobTitle, interviewTitle, scheduledAt, duration, location } = data;

    const formattedDate = this.formatDate(scheduledAt);
    const formattedTime = this.formatTime(scheduledAt);

    const subject = `面试邀请 - ${jobTitle} - ${interviewTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎮 面试邀请</h1>
            <p>GameTalent OS - 游戏人才招聘系统</p>
          </div>
          <div class="content">
            <p>亲爱的 <strong>${candidateName}</strong>：</p>
            <p>恭喜您通过初筛！我们诚挚邀请您参加 <strong>${jobTitle}</strong> 职位的面试。</p>

            <div class="info-box">
              <div class="info-item">
                <span class="label">面试主题：</span>
                <span>${interviewTitle}</span>
              </div>
              <div class="info-item">
                <span class="label">面试官：</span>
                <span>${interviewerName}</span>
              </div>
              <div class="info-item">
                <span class="label">日期：</span>
                <span>${formattedDate}</span>
              </div>
              <div class="info-item">
                <span class="label">时间：</span>
                <span>${formattedTime}</span>
              </div>
              <div class="info-item">
                <span class="label">时长：</span>
                <span>${duration} 分钟</span>
              </div>
              ${location ? `
              <div class="info-item">
                <span class="label">地点/链接：</span>
                <span>${location}</span>
              </div>
              ` : ''}
            </div>

            <p>请确认您能够准时参加面试。如有任何问题，请及时联系我们。</p>

            <div class="footer">
              <p>此邮件由 GameTalent OS 自动发送，请勿直接回复。</p>
              <p>© 2026 GameTalent OS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: candidateEmail,
      subject,
      html,
    });
  }

  /**
   * 发送面试提醒邮件
   */
  async sendInterviewReminder(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    interviewTitle: string;
    scheduledAt: Date;
    location?: string;
    hoursBefore?: number;
  }): Promise<boolean> {
    const { candidateEmail, candidateName, jobTitle, interviewTitle, scheduledAt, location, hoursBefore } = data;

    const formattedDate = this.formatDate(scheduledAt);
    const formattedTime = this.formatTime(scheduledAt);
    const reminderText = hoursBefore ? `还有 ${hoursBefore} 小时开始` : '即将开始';

    const subject = `面试提醒 - ${jobTitle} - ${reminderText}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f5576c; border-radius: 4px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ 面试提醒</h1>
            <p>您的面试 ${reminderText}</p>
          </div>
          <div class="content">
            <p>亲爱的 <strong>${candidateName}</strong>：</p>
            <p>您好！这是您面试的温馨提醒。</p>

            <div class="info-box">
              <div class="info-item">
                <span class="label">面试主题：</span>
                <span>${interviewTitle}</span>
              </div>
              <div class="info-item">
                <span class="label">应聘职位：</span>
                <span>${jobTitle}</span>
              </div>
              <div class="info-item">
                <span class="label">日期：</span>
                <span>${formattedDate}</span>
              </div>
              <div class="info-item">
                <span class="label">时间：</span>
                <span>${formattedTime}</span>
              </div>
              ${location ? `
              <div class="info-item">
                <span class="label">地点/链接：</span>
                <span>${location}</span>
              </div>
              ` : ''}
            </div>

            <p>请提前做好准备，祝您面试顺利！💪</p>

            <div class="footer">
              <p>此邮件由 GameTalent OS 自动发送，请勿直接回复。</p>
              <p>© 2026 GameTalent OS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: candidateEmail,
      subject,
      html,
    });
  }

  /**
   * 发送 Offer 邮件
   */
  async sendOffer(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    companyName?: string;
    salary?: string;
    startDate?: Date;
  }): Promise<boolean> {
    const { candidateEmail, candidateName, jobTitle, companyName, salary, startDate } = data;

    const subject = `🎉 恭喜！您已获得 ${jobTitle} 职位 Offer`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #38ef7d; border-radius: 4px; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 恭喜！</h1>
            <p>您已成功获得 Offer</p>
          </div>
          <div class="content">
            <p>亲爱的 <strong>${candidateName}</strong>：</p>
            <p>我们很高兴地通知您，经过层层筛选，您已成功获得 <strong>${jobTitle}</strong> 职位！</p>

            <div class="info-box">
              <div class="info-item">
                <span class="label">公司：</span>
                <span>${companyName || 'GameTalent OS'}</span>
              </div>
              <div class="info-item">
                <span class="label">职位：</span>
                <span>${jobTitle}</span>
              </div>
              ${salary ? `
              <div class="info-item">
                <span class="label">薪资：</span>
                <span>${salary}</span>
              </div>
              ` : ''}
              ${startDate ? `
              <div class="info-item">
                <span class="label">入职日期：</span>
                <span>${this.formatDate(startDate)}</span>
              </div>
              ` : ''}
            </div>

            <p>我们期待您的加入，共同创造精彩！</p>
            <p>HR 团队将在 1-2 个工作日内与您联系，详细沟通入职事宜。</p>

            <div class="footer">
              <p>此邮件由 GameTalent OS 自动发送，请勿直接回复。</p>
              <p>© 2026 GameTalent OS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: candidateEmail,
      subject,
      html,
    });
  }

  /**
   * 发送职位关闭通知
   */
  async sendJobClosed(data: {
    candidateEmail: string;
    candidateName: string;
    jobTitle: string;
    reason?: string;
  }): Promise<boolean> {
    const { candidateEmail, candidateName, jobTitle, reason } = data;

    const subject = `职位关闭通知 - ${jobTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #6c757d; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #888; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 职位关闭通知</h1>
          </div>
          <div class="content">
            <p>亲爱的 <strong>${candidateName}</strong>：</p>
            <p>感谢您对 <strong>${jobTitle}</strong> 职位的关注。</p>

            <div class="info-box">
              <p>我们遗憾地通知您，该职位已关闭。</p>
              ${reason ? `<p><strong>关闭原因：</strong>${reason}</p>` : ''}
            </div>

            <p>您的简历已保留在我们的人才库中，如有合适的职位，我们会第一时间与您联系。</p>
            <p>再次感谢您的关注与支持！</p>

            <div class="footer">
              <p>此邮件由 GameTalent OS 自动发送，请勿直接回复。</p>
              <p>© 2026 GameTalent OS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail({
      to: candidateEmail,
      subject,
      html,
    });
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(date);
  }

  /**
   * 格式化时间
   */
  private formatTime(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
}
