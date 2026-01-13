import { PartnersService } from './partners.service';
export declare class PartnersController {
    private readonly partnersService;
    constructor(partnersService: PartnersService);
    createPartner(req: any, body: {
        name: string;
        phone: string;
        email: string;
        areas: string[];
    }): Promise<any>;
    listPartners(req: any): Promise<any[]>;
}
//# sourceMappingURL=partners.controller.d.ts.map