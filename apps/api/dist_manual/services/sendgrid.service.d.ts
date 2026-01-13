export declare class SendGridService {
    constructor();
    sendVerificationEmail(to: string, code: string): Promise<void>;
    sendInviteEmail(to: string, inviteLink: string, tenantName: string): Promise<void>;
}
//# sourceMappingURL=sendgrid.service.d.ts.map