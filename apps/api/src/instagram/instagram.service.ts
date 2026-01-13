import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InstagramService {
    private readonly logger = new Logger(InstagramService.name);
    private readonly apiUrl = 'https://graph.facebook.com/v18.0';
    private readonly accessToken: string;
    private readonly igUserId: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.accessToken = this.configService.get('INSTAGRAM_ACCESS_TOKEN');
        this.igUserId = this.configService.get('INSTAGRAM_USER_ID');
    }

    /**
     * 📸 Publicar Imagem no Feed
     */
    async publishImage(imageUrl: string, caption: string) {
        try {
            // 1. Criar container da mídia
            const containerResponse = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/${this.igUserId}/media`,
                    {
                        image_url: imageUrl,
                        caption: caption,
                        access_token: this.accessToken,
                    }
                )
            );

            const creationId = containerResponse.data.id;

            // 2. Publicar o container
            const publishResponse = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/${this.igUserId}/media_publish`,
                    {
                        creation_id: creationId,
                        access_token: this.accessToken,
                    }
                )
            );

            this.logger.log(`Post publicado: ${publishResponse.data.id}`);
            return publishResponse.data;
        } catch (error) {
            this.logger.error('Erro ao publicar imagem:', error.response?.data);
            throw error;
        }
    }

    /**
     * 📹 Publicar Carrossel
     */
    async publishCarousel(items: Array<{ imageUrl: string }>, caption: string) {
        try {
            // 1. Criar containers para cada imagem
            const containerIds = await Promise.all(
                items.map(async (item) => {
                    const response = await firstValueFrom(
                        this.httpService.post(
                            `${this.apiUrl}/${this.igUserId}/media`,
                            {
                                image_url: item.imageUrl,
                                is_carousel_item: true,
                                access_token: this.accessToken,
                            }
                        )
                    );
                    return response.data.id;
                })
            );

            // 2. Criar container do carrossel
            const carouselResponse = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/${this.igUserId}/media`,
                    {
                        media_type: 'CAROUSEL',
                        children: containerIds,
                        caption: caption,
                        access_token: this.accessToken,
                    }
                )
            );

            // 3. Publicar
            const publishResponse = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/${this.igUserId}/media_publish`,
                    {
                        creation_id: carouselResponse.data.id,
                        access_token: this.accessToken,
                    }
                )
            );

            return publishResponse.data;
        } catch (error) {
            this.logger.error('Erro ao publicar carrossel:', error.response?.data);
            throw error;
        }
    }

    /**
     * 💬 Buscar Comentários de um Post
     */
    async getPostComments(mediaId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/${mediaId}/comments`,
                    {
                        params: {
                            fields: 'id,text,username,timestamp,replies',
                            access_token: this.accessToken,
                        },
                    }
                )
            );

            return response.data.data;
        } catch (error) {
            this.logger.error('Erro ao buscar comentários:', error.response?.data);
            throw error;
        }
    }

    /**
     * ✍️ Responder Comentário
     */
    async replyToComment(commentId: string, message: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.apiUrl}/${commentId}/replies`,
                    {
                        message: message,
                        access_token: this.accessToken,
                    }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error('Erro ao responder comentário:', error.response?.data);
            throw error;
        }
    }

    /**
     * 📊 Buscar Insights do Perfil
     */
    async getAccountInsights(metrics: string[] = ['impressions', 'reach', 'profile_views']) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/${this.igUserId}/insights`,
                    {
                        params: {
                            metric: metrics.join(','),
                            period: 'day',
                            access_token: this.accessToken,
                        },
                    }
                )
            );

            return response.data.data;
        } catch (error) {
            this.logger.error('Erro ao buscar insights:', error.response?.data);
            throw error;
        }
    }

    /**
     * 📝 Buscar Informações do Perfil
     */
    async getProfile() {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `${this.apiUrl}/${this.igUserId}`,
                    {
                        params: {
                            fields: 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url',
                            access_token: this.accessToken,
                        },
                    }
                )
            );

            return response.data;
        } catch (error) {
            this.logger.error('Erro ao buscar perfil:', error.response?.data);
            throw error;
        }
    }
}
