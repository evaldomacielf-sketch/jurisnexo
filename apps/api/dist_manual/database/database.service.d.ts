import { OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class DatabaseService implements OnModuleInit {
    private _client;
    onModuleInit(): void;
    get client(): SupabaseClient<any, "public", any, any, any>;
}
//# sourceMappingURL=database.service.d.ts.map