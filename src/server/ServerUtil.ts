/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';
import { Environment } from './model/Environment';
import { PluginService } from './services/PluginService';

const path = require('path');

export class ServerUtil {

    public static isProductionMode(): boolean {
        const environment = this.getEnvironment();
        return environment === Environment.PRODUCTION ||
            (environment !== Environment.DEVELOPMENT && environment !== Environment.TEST);
    }

    public static isDevelopmentMode(): boolean {
        return this.getEnvironment() === Environment.DEVELOPMENT;
    }

    public static isTestMode(): boolean {
        return this.getEnvironment() === Environment.TEST;
    }

    private static getEnvironment(): string {
        let nodeEnv = process.env.NODE_ENV;
        if (!nodeEnv) {
            nodeEnv = Environment.PRODUCTION;
        }

        return nodeEnv.toLocaleLowerCase();
    }

    public static async buildApplications(): Promise<void> {
        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules'
        ];
        await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
        await MarkoService.getInstance().initializeMarkoApplications();
    }


    public static async initPlugins(): Promise<void> {
        // load registered plugins
        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules'
        ];
        await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
    }
}
