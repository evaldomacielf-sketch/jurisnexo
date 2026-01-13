import { Injectable, OnModuleInit } from '@nestjs/common';
import { createAdminClient } from '@jurisnexo/db';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private _client!: SupabaseClient<any, "public", any>; // using verify type from packages/db/types if possible, but any is safe for now to avoid complexity

    onModuleInit() {
        // createAdminClient reads env vars internally
        this._client = createAdminClient();
    }

    get client() {
        return this._client;
    }
}
