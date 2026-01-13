import { Injectable, LoggerService } from '@nestjs/common';
import { Logging } from '@google-cloud/logging';

@Injectable()
export class GcpLoggerService implements LoggerService {
    private logging: Logging;
    private log: any;
    private metadata: any;

    constructor() {
        this.logging = new Logging();
        // Identifies the log in Cloud Logging
        this.log = this.logging.log('jurisnexo-api');

        // Resource metadata helps filter logs by resource type
        this.metadata = {
            resource: { type: 'global' }, // Or 'cloud_run_revision' / 'k8s_container' if we can detect env
        };
    }

    log(message: any, ...optionalParams: any[]) {
        this.writeLog('INFO', message, optionalParams);
    }

    error(message: any, ...optionalParams: any[]) {
        this.writeLog('ERROR', message, optionalParams);
    }

    warn(message: any, ...optionalParams: any[]) {
        this.writeLog('WARNING', message, optionalParams);
    }

    debug?(message: any, ...optionalParams: any[]) {
        this.writeLog('DEBUG', message, optionalParams);
    }

    verbose?(message: any, ...optionalParams: any[]) {
        this.writeLog('DEFAULT', message, optionalParams);
    }

    private async writeLog(severity: string, message: any, optionalParams: any[]) {
        const entry = this.log.entry(
            { ...this.metadata, severity },
            {
                message: typeof message === 'string' ? message : JSON.stringify(message),
                params: optionalParams,
                timestamp: new Date().toISOString(),
                // Add context if available (traceId, tenantId would need Request Scoped logger)
            }
        );

        try {
            if (process.env.NODE_ENV === 'production') {
                await this.log.write(entry);
            } else {
                // Fallback to console in dev
                console.log(`[${severity}]`, message, ...optionalParams);
            }
        } catch (err) {
            console.error('Failed to write to Cloud Logging', err);
        }
    }
}
