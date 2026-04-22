/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MigrationService } from '../frontend-applications/agent-portal/migrations/MigrationService';
import { IInitialDataExtension } from '../frontend-applications/agent-portal/model/IInitialDataExtension';
import { AgentPortalExtensions } from '../frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { IServiceExtension } from '../frontend-applications/agent-portal/server/extensions/IServiceExtension';
import { ClientNotificationService } from '../frontend-applications/agent-portal/server/services/ClientNotificationService';
import { ClientRegistrationService } from '../frontend-applications/agent-portal/server/services/ClientRegistrationService';
import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';
import { Environment } from './model/Environment';
import { LoggingService } from './services/LoggingService';
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

    public async initPlugins(): Promise<void> {
        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules'
        ];
        await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
    }

    public static async buildApplications(applicationNames?: string[]): Promise<void> {
        await MarkoService.getInstance().initializeMarkoApplications(applicationNames);
    }

    public static async initPlugins(): Promise<void> {
        LoggingService.getInstance().info('[SERVER] start PluginService - initialization');

        // load registered plugins
        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules'
        ];
        await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

        LoggingService.getInstance().info('[SERVER] start PluginService - initialization finished');
    }

    public static async initServices(): Promise<void> {
        LoggingService.getInstance().info('[SERVER] start ServiceUtil - initialization');

        const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
            AgentPortalExtensions.SERVICES
        );

        LoggingService.getInstance().info(`[SERVER] Initialize ${serviceExtensions.length} service extensions`);

        for (const extension of serviceExtensions) {
            await extension.initServices();
        }

        ClientNotificationService.getInstance();

        LoggingService.getInstance().info('[SERVER] start ServiceUtil - initialization finished');
    }

    public static async createClientRegistration(): Promise<void> {
        LoggingService.getInstance().info('[Clientregistration] start');
        await ClientRegistrationService.getInstance().createClientRegistration();
        LoggingService.getInstance().info('[Clientregistration] finished');
    }

    public static async importInitialData(): Promise<void> {
        LoggingService.getInstance().info('[INITIAL DATA] start');
        const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
            AgentPortalExtensions.INITIAL_DATA
        );
        LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
        for (const extension of initialDataExtensions) {
            await extension.createData().catch((e) => {
                LoggingService.getInstance().error(`Error creating inital data: ${extension.name}.`, e);
            });
        }
        LoggingService.getInstance().info('[INITIAL DATA] finished');
    }

    public static async migrate(): Promise<void> {
        LoggingService.getInstance().info('[Migration] start');
        const success = await MigrationService.getInstance().startMigration();
        if (!success) {
            LoggingService.getInstance().error('Startup failed. Could not migrate!');
            process.exit(1);
        }
        LoggingService.getInstance().info('[Migration] finished');
    }
}
