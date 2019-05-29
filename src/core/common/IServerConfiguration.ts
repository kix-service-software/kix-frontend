import { LogLevel } from './LogLevel';

export interface IServerConfiguration {

    HTTP_PORT: number;

    HTTPS_PORT: number;

    USE_SSL: boolean;

    PLUGIN_FOLDERS: string[];

    FRONTEND_URL: string;

    NOTIFICATION_URL: string;

    NOTIFICATION_INTERVAL: number;

    NOTIFICATION_CLIENT_ID: string;

    BACKEND_API_URL: string;

    LOG_LEVEL: LogLevel;

    LOG_FILEDIR: string;

    LOG_TRACE: boolean;

    DEFAULT_MODULE_ID: string;

    ENABLE_PROFILING: boolean;

    BACKEND_API_TOKEN: string;

    SOCKET_TIMEOUT: number;

    UPDATE_TRANSLATIONS: boolean;

    USE_IN_MEMORY_CACHE: boolean;

    USE_REDIS_CACHE: boolean;

    REDIS_CACHE_PORT: number;

    REDIS_CACHE_HOST: string;

}
