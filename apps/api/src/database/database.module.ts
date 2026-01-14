import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { createAdminClient } from '@jurisnexo/db';

const supabaseClientProvider = {
    provide: 'SUPABASE_CLIENT',
    useFactory: () => {
        return createAdminClient();
    },
};

@Global()
@Module({
    providers: [DatabaseService, supabaseClientProvider],
    exports: [DatabaseService, 'SUPABASE_CLIENT'],
})
export class DatabaseModule { }
