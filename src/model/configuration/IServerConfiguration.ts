import { LogLevel } from '../logging/LogLevel';

export interface IServerConfiguration {

    SERVER_PORT: number;

    SOCKET_COMMUNICATION_PORT: number;

    PLUGIN_FOLDERS: string[];

    FRONTEND_URL: string;

    FRONTEND_SOCKET_URL: string;

    BACKEND_API_URL: string;

    LOG_LEVEL: LogLevel;

    LOG_FILEDIR: string;

    LOG_TRACE: boolean;
}
