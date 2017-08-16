import { LogLevel } from './../../model/logging/LogLevel';
export interface IServerConfiguration {

    SERVER_PORT: number;

    PLUGIN_FOLDERS: string[];

    BACKEND_API_URL: string;

    LOG_LEVEL: LogLevel;
    LOG_FILE: string;
    LOG_TRACE: boolean;
}
