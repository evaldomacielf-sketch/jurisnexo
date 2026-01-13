import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IgApiClient } from 'instagram-private-api';

@Injectable()
export class InstagramPrivateService implements OnModuleInit {
    private readonly logger = new Logger(InstagramPrivateService.name);
    private readonly ig = new IgApiClient();
    private isAuthenticated = false;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        // Optional: Login on startup if credentials are provided
        // this.login();
    }

    /**
     * 🔐 Login na API Privada
     */
    async login() {
        try {
            const username = this.configService.get<string>('INSTAGRAM_USERNAME');
            const password = this.configService.get<string>('INSTAGRAM_PASSWORD');

            if (!username || !password) {
                this.logger.warn('Credenciais do Instagram (Private API) não configuradas.');
                return;
            }

            this.ig.state.generateDevice(username);
            await this.ig.account.login(username, password);
            this.isAuthenticated = true;
            this.logger.log(`✅ Logado na API Privada como ${username}`);
        } catch (error) {
            this.logger.error('Erro no login da API Privada:', error);
            throw error;
        }
    }

    /**
     * 📨 Enviar DM (Private API)
     */
    async sendDirectMessage(username: string, message: string) {
        if (!this.isAuthenticated) {
            await this.login();
        }

        try {
            const userId = await this.ig.user.getIdByUsername(username);
            const thread = this.ig.entity.directThread([userId.toString()]);
            await thread.broadcastText(message);

            this.logger.log(`DM enviada via Private API para @${username}`);
            return { success: true, recipient: username };
        } catch (error) {
            this.logger.error(`Erro ao enviar DM para @${username}:`, error);
            throw error;
        }
    }

    /**
     * 🔍 Buscar Usuário por Username
     */
    async searchUser(username: string) {
        if (!this.isAuthenticated) {
            await this.login();
        }
        return this.ig.user.searchExact(username);
    }
}
