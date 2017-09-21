import { LogLevel } from '../logging/LogLevel';

export interface IServerConfiguration {

    HTTP_PORT: number;

    HTTPS_PORT: number;

    PLUGIN_FOLDERS: string[];

    FRONTEND_URL: string;

    BACKEND_API_URL: string;

    LOG_LEVEL: LogLevel;

    LOG_FILEDIR: string;

    LOG_TRACE: boolean;

    DEFAULT_MODULE_ID: string;
}
