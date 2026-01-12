import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { env } from '@jurisnexo/config';

@Injectable()
export class SendGridService {
    constructor() {
        if (env.SENDGRID_API_KEY) {
            sgMail.setApiKey(env.SENDGRID_API_KEY);
        } else {
            console.warn('⚠️ SENDGRID_API_KEY not set. Email sending will check env at runtime.');
        }
    }

    async sendVerificationEmail(to: string, code: string): Promise<void> {
        if (!env.SENDGRID_API_KEY) {
            console.warn(`[DEV] Mock sending email to ${to} with code ${code}`);
            return;
        }

        const msg = {
            to,
            from: env.EMAIL_FROM || 'noreply@jurisnexo.com.br',
            subject: 'Seu código de verificação - JurisNexo',
            text: `Seu código de acesso é: ${code}. Ele expira em 2 minutos.`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Código de Verificação</h2>
          <p>Use o código abaixo para acessar sua conta:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">Este código expira em 2 minutos.</p>
          <p style="font-size: 12px; color: #999;">Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      `,
        };

        try {
            await sgMail.send(msg);
            console.log(`📧 Email sent to ${to}`);
        } catch (error) {
            console.error('❌ Error sending email:', error);
            if ((error as any).response) {
                console.error((error as any).response.body);
            }
            throw new Error('Failed to send verification email');
        }
    }
}
