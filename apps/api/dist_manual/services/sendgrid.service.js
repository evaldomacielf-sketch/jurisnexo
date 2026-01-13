"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridService = void 0;
const common_1 = require("@nestjs/common");
const sgMail = __importStar(require("@sendgrid/mail"));
const config_1 = require("@jurisnexo/config");
let SendGridService = class SendGridService {
    constructor() {
        if (config_1.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(config_1.env.SENDGRID_API_KEY);
        }
        else {
            console.warn('⚠️ SENDGRID_API_KEY not set. Email sending will check env at runtime.');
        }
    }
    async sendVerificationEmail(to, code) {
        if (!config_1.env.SENDGRID_API_KEY) {
            console.warn(`[DEV] Mock sending email to ${to} with code ${code}`);
            return;
        }
        const msg = {
            to,
            from: config_1.env.EMAIL_FROM || 'noreply@jurisnexo.com.br',
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
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
            if (error.response) {
                console.error(error.response.body);
            }
            throw new Error('Failed to send verification email');
        }
    }
    async sendInviteEmail(to, inviteLink, tenantName) {
        if (!config_1.env.SENDGRID_API_KEY) {
            console.warn(`[DEV] Mock sending invite email to ${to} for ${tenantName}. Link: ${inviteLink}`);
            return;
        }
        const msg = {
            to,
            from: config_1.env.EMAIL_FROM || 'noreply@jurisnexo.com.br',
            subject: `Convite para participar do escritório ${tenantName} - JurisNexo`,
            text: `Você foi convidado para participar do escritório ${tenantName} no JurisNexo. Acesse: ${inviteLink}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Convite de Acesso</h2>
          <p>Você foi convidado para participar do escritório <strong>${tenantName}</strong> no JurisNexo.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #1152d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Aceitar Convite</a>
          </div>
          <p style="color: #666;">Ou copie e cole este link no seu navegador:</p>
          <p style="background: #f4f4f4; padding: 10px; word-break: break-all; font-size: 12px;">${inviteLink}</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Este convite expira em 7 dias.</p>
        </div>
      `,
        };
        try {
            await sgMail.send(msg);
            console.log(`📧 Invite email sent to ${to}`);
        }
        catch (error) {
            console.error('❌ Error sending invite email:', error);
            throw new Error('Failed to send invite email');
        }
    }
};
exports.SendGridService = SendGridService;
exports.SendGridService = SendGridService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SendGridService);
//# sourceMappingURL=sendgrid.service.js.map