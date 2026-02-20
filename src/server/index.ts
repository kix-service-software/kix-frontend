/* eslint-disable max-lines-per-function */
/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { LoggingService } from './services/LoggingService';

import cluster from 'node:cluster';

import { cpus } from 'node:os';
import { ClientRegistrationService } from '../frontend-applications/agent-portal/server/services/ClientRegistrationService';
import { PluginService } from './services/PluginService';
import { ServerExtensions } from './model/ServerExtensions';
import { IFrontendServerExtension } from './model/IFrontendServerExtension';
import { FileService } from '../frontend-applications/agent-portal/modules/file/server/FileService';
import { ServerUtil } from './ServerUtil';
import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';

const path = require('path');

process.setMaxListeners(0);

async function initializeServer(): Promise<void> {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(dataDir);
    FileService.initialize();

    initProcessListener();

    await ServerUtil.initPlugins();
    await ServerUtil.initServices();

    let serverExtensions = await PluginService.getInstance().getExtensions<IFrontendServerExtension>(
        ServerExtensions.APPLICATION_SERVER
    );

    const applicationNames = ConfigurationService.getEnvString('APPLICATION')?.split(',').map((a) => a.trim());
    if (applicationNames?.length) {
        serverExtensions = serverExtensions?.filter((se) => applicationNames.some((an) => an === se.name));
    }

    if (!serverExtensions?.length) {
        LoggingService.getInstance().error(`[SERVER] stop error - no extension for application ${applicationNames?.join(',')} available!`);
        process.exit(1);
    }

    const servers = serverExtensions?.map((e) => e.getServer());
    if (!servers) {
        LoggingService.getInstance().error(`[SERVER] stop error - Extension for application ${applicationNames} did not provide a server implementation!`);
        process.exit(1);
    }

    LoggingService.getInstance().info('[SERVER] start Applications');

    await createClientRegistration();

    if (ConfigurationService.getEnvNumber('CLUSTER_ENABLED') === 1) {
        initCluster(servers);
    } else {
        await ServerUtil.buildApplications(applicationNames);

        for (const server of servers) {
            await server.initialize();
            LoggingService.getInstance().info(
                `[SERVER] started - ${server.name} is running on http://FQDN:${server.getPort()}`
            );
        }
    }
}

async function initCluster(servers: any[]): Promise<void> {
    if (cluster.isPrimary) {
        LoggingService.getInstance().info('CLUSTER - Master start');

        await ServerUtil.buildApplications();

        const numCPUs = ConfigurationService.getEnvNumber('CLUSTER_WORKER_COUNT') || cpus().length;
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker) => {
            LoggingService.getInstance().info(`Worker ${worker.process.pid} died`);
            cluster.fork();
        });

    } else {
        LoggingService.getInstance().info(`CLUSTER - Worker ${process.pid} started`);
        MarkoService.getInstance();

        for (const server of servers) {
            await server.initialize();
        }
    }
}

async function createClientRegistration(): Promise<void> {
    const disabled = ConfigurationService.getEnvNumber('DISABLE_CLIENT_REGISTRATION');
    if (disabled) {
        await setSystemInfo();
    } else {
        await ServerUtil.createClientRegistration();
        await ServerUtil.importInitialData();
        if (ConfigurationService.getEnvNumber('FE_UPDATE') === 1) {
            await ServerUtil.migrate();
        }
    }
}

async function setSystemInfo(): Promise<void> {
    await ClientRegistrationService.getInstance().setSystemInfo()
        .catch((error) => {
            LoggingService.getInstance().error(error);
            LoggingService.getInstance().error(
                'Failed to retrieve system info from backend. See errors above.'
            );
            process.exit(1);
        });
}

function initProcessListener(): void {
    LoggingService.getInstance().info('[SERVER] start ProcessListener - initialization');

    process.on('unhandledRejection', (reason, promise) => {
        LoggingService.getInstance().error('An unhandledRejection occured:', reason);
        LoggingService.getInstance().error(reason.toString(), reason);
        console.error('Unhandled Rejection at: Promise', promise, 'reason:', reason);
        console.error(reason);
    });

    process.on('uncaughtException', (reason, promise) => {
        LoggingService.getInstance().error('An uncaughtException occured:', reason);
        LoggingService.getInstance().error(reason.toString(), reason);
        console.error('uncaught Exception at: Promise', promise, 'reason:', reason);
        console.error(reason);
    });

    process.on('exit', () => {
        LoggingService.getInstance().warning('Exit NodeJS process');
        const error = new Error().stack;
        LoggingService.getInstance().error('Exit NodeJS process', error);
        console.trace('');
    });

    LoggingService.getInstance().info('[SERVER] start ProcessListener - finished');
}


initializeServer();