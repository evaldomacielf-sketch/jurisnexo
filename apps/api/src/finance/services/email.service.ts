import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplateData {
  clienteNome: string;
  escritorioNome: string;
  valor?: number;
  dataVencimento?: string;
  linkPagamento?: string;
  numeroHonorario?: string;
  [key: string]: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@jurisnexo.com';
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'JurisNexo - Sistema Jurídico';

    this.initializeTransporter();
  }

  private initializeTransporter() {
    const provider = this.configService.get<string>('EMAIL_PROVIDER') || 'smtp';

    if (provider === 'sendgrid') {
      const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
      if (apiKey) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: apiKey,
          },
        });
      }
    } else {
      const host = this.configService.get<string>('SMTP_HOST');
      const port = this.configService.get<number>('SMTP_PORT') || 587;
      const user = this.configService.get<string>('SMTP_USER');
      const pass = this.configService.get<string>('SMTP_PASS');

      if (host && user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      }
    }

    if (!this.transporter) {
      this.logger.warn('Email service not configured - emails will be logged only');
    }
  }

  async sendEmail(dto: SendEmailDto): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.log(`[EMAIL MOCK] To: ${dto.to}, Subject: ${dto.subject}`);
        return true;
      }

      await this.transporter.sendMail({
        from: dto.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
        replyTo: dto.replyTo,
        attachments: dto.attachments,
      });

      this.logger.log(`Email sent to ${dto.to}: ${dto.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}`, error);
      return false;
    }
  }

  async sendPaymentConfirmation(
    email: string,
    data: EmailTemplateData,
  ): Promise<boolean> {
    const html = this.getPaymentConfirmationTemplate(data);
    return this.sendEmail({
      to: email,
      subject: `Pagamento Confirmado - ${data.escritorioNome}`,
      html,
    });
  }

  async sendPaymentReminder(
    email: string,
    data: EmailTemplateData,
  ): Promise<boolean> {
    const html = this.getPaymentReminderTemplate(data);
    return this.sendEmail({
      to: email,
      subject: `Lembrete de Pagamento - ${data.escritorioNome}`,
      html,
    });
  }

  async sendPaymentLink(
    email: string,
    data: EmailTemplateData,
  ): Promise<boolean> {
    const html = this.getPaymentLinkTemplate(data);
    return this.sendEmail({
      to: email,
      subject: `Link de Pagamento - ${data.escritorioNome}`,
      html,
    });
  }

  async sendPaymentFailed(
    email: string,
    data: EmailTemplateData,
  ): Promise<boolean> {
    const html = this.getPaymentFailedTemplate(data);
    return this.sendEmail({
      to: email,
      subject: `❌ Falha no Pagamento - ${data.escritorioNome}`,
      html,
    });
  }

  async sendInvoice(
    email: string,
    data: EmailTemplateData,
    pdfBuffer: Buffer,
    filename: string = 'nota-fiscal.pdf',
  ): Promise<boolean> {
    const html = this.getInvoiceTemplate(data);
    return this.sendEmail({
      to: email,
      subject: `📄 Sua Nota Fiscal - ${data.escritorioNome}`,
      html,
      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  private getPaymentConfirmationTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pagamento Confirmado!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.clienteNome}</strong>,</p>
            <p>Seu pagamento foi confirmado com sucesso!</p>
            ${data.valor ? `<p class="amount">R$ ${data.valor.toFixed(2)}</p>` : ''}
            ${data.numeroHonorario ? `<p>Referência: Honorário #${data.numeroHonorario}</p>` : ''}
            <p>Obrigado por utilizar nossos serviços.</p>
          </div>
          <div class="footer">
            <p>${data.escritorioNome}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentReminderTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Lembrete de Pagamento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.clienteNome}</strong>,</p>
            <p>Este é um lembrete amigável sobre um pagamento pendente.</p>
            ${data.valor ? `<p class="amount">R$ ${data.valor.toFixed(2)}</p>` : ''}
            ${data.dataVencimento ? `<p>Data de vencimento: ${data.dataVencimento}</p>` : ''}
            ${data.linkPagamento ? `<p><a href="${data.linkPagamento}" class="btn">Pagar Agora</a></p>` : ''}
          </div>
          <div class="footer">
            <p>${data.escritorioNome}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentLinkTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #3b82f6; }
          .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Link de Pagamento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.clienteNome}</strong>,</p>
            <p>Segue abaixo o link para realizar o pagamento de seus honorários:</p>
            ${data.valor ? `<p class="amount">R$ ${data.valor.toFixed(2)}</p>` : ''}
            ${data.numeroHonorario ? `<p>Referência: Honorário #${data.numeroHonorario}</p>` : ''}
            ${data.linkPagamento ? `<p><a href="${data.linkPagamento}" class="btn">Realizar Pagamento</a></p>` : ''}
            <p><small>Este link é seguro e criptografado.</small></p>
          </div>
          <div class="footer">
            <p>${data.escritorioNome}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPaymentFailedTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #ef4444; }
          .btn { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Falha no Pagamento</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.clienteNome}</strong>,</p>
            <p>Infelizmente, houve uma falha ao processar seu pagamento.</p>
            ${data.valor ? `<p class="amount">R$ ${data.valor.toFixed(2)}</p>` : ''}
            ${data.numeroHonorario ? `<p>Referência: Honorário #${data.numeroHonorario}</p>` : ''}
            <p>Por favor, verifique os dados do cartão ou tente outro método de pagamento.</p>
            ${data.linkPagamento ? `<p><a href="${data.linkPagamento}" class="btn">Tentar Novamente</a></p>` : ''}
          </div>
          <div class="footer">
            <p>${data.escritorioNome}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getInvoiceTemplate(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Sua Nota Fiscal</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${data.clienteNome}</strong>,</p>
            <p>Segue em anexo a nota fiscal referente ao seu pagamento.</p>
            ${data.numeroHonorario ? `<p>Referência: Honorário #${data.numeroHonorario}</p>` : ''}
            ${data.valor ? `<p>Valor: R$ ${data.valor.toFixed(2)}</p>` : ''}
            <p>Obrigado por utilizar nossos serviços!</p>
          </div>
          <div class="footer">
            <p>${data.escritorioNome}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
