import { Injectable, OnModuleInit } from '@nestjs/common';
import { createAdminClient } from '@jurisnexo/db';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private _client!: SupabaseClient<any, 'public', any>;

  onModuleInit() {
    this._client = createAdminClient();
  }

  get client() {
    return this._client;
  }
}
