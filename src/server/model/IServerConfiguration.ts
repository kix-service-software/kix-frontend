/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LogLevel } from "./LogLevel";

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

    UPDATE_TRANSLATIONS: boolean;

    USE_IN_MEMORY_CACHE: boolean;

    USE_REDIS_CACHE: boolean;

    REDIS_CACHE_PORT: number;

    REDIS_CACHE_HOST: string;

}
