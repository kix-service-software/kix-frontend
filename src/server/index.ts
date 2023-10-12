/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { LoggingService } from './services/LoggingService';

const cluster = require('cluster');

const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');

import { cpus } from 'node:os';
import { MigrationService } from '../frontend-applications/agent-portal/migrations/MigrationService';
import { IInitialDataExtension } from '../frontend-applications/agent-portal/model/IInitialDataExtension';
import { AgentPortalExtensions } from '../frontend-applications/agent-portal/server/extensions/AgentPortalExtensions';
import { ClientRegistrationService } from '../frontend-applications/agent-portal/server/services/ClientRegistrationService';
import { MarkoService } from '../frontend-applications/agent-portal/server/services/MarkoService';
import { SocketService } from '../frontend-applications/agent-portal/server/services/SocketService';
import { PluginService } from './services/PluginService';
import { AuthenticationService } from './services/AuthenticationService';
import { IServer } from './model/IServer';
import { IServiceExtension } from '../frontend-applications/agent-portal/server/extensions/IServiceExtension';
import { ServerExtensions } from './model/ServerExtensions';
import { IFrontendServerExtension } from './model/IFrontendServerExtension';
import { ServerManager } from './ServerManager';

const path = require('path');

process.setMaxListeners(0);

async function initializeServer(): Promise<void> {
    const configDir = path.join(__dirname, '..', '..', 'config');
    const certDir = path.join(__dirname, '..', '..', 'cert');
    const dataDir = path.join(__dirname, '..', '..', 'data');
    ConfigurationService.getInstance().init(configDir, certDir, dataDir);

    LoggingService.getInstance().info('[SERVER] Start');

    const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

    await initPlugins();
    const serviceExtensions = await PluginService.getInstance().getExtensions<IServiceExtension>(
        AgentPortalExtensions.SERVICES
    );
    LoggingService.getInstance().info(`Initialize ${serviceExtensions.length} service extensions`);
    for (const extension of serviceExtensions) {
        await extension.initServices();
    }

    const serverExtensions = await PluginService.getInstance().getExtensions<IFrontendServerExtension>(
        ServerExtensions.APPLICATION_SERVER
    );


    for (const extension of serverExtensions) {
        ServerManager.getInstance().registerServer(extension.getServer());
    }

    const servers: IServer[] = ServerManager.getInstance().getServers();

    initProcessListener();

    if (serverConfig.CLUSTER_ENABLED) {
        if (cluster.isPrimary) {

            LoggingService.getInstance().info('CLUSTER - Master start');

            await initializeFrontend();
            await buildApplications();

            for (const server of servers) {
                await server.initialize();
                const httpServer = server.getHttpServer();
                const port = server.getPort();

                setupMaster(httpServer, {
                    loadBalancingMethod: 'least-connection',
                });

                setupPrimary();

                httpServer.listen(port);
                LoggingService.getInstance().info(`Frontend server is running on HTTPS: https://FQDN:${port}`);
            }
            const numCPUs = serverConfig.CLUSTER_WORKER_COUNT || cpus().length;
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker) => {
                LoggingService.getInstance().info(`Worker ${worker.process.pid} died`);
                // cluster.fork();
            });

        } else {
            LoggingService.getInstance().info(`CLUSTER - Worker ${process.pid} started`);

            await buildApplications();

            for (const server of servers) {
                await server.initialize();
                // use the cluster adapter
                server.getSocketIO().adapter(createAdapter());

                // setup connection with the primary process
                setupWorker(server.getSocketIO());
            }
        }
    } else {
        await initializeFrontend();
        await buildApplications();

        for (const server of servers) {
            await server.initialize();
            server.initializeSocketIO();
            server.getHttpServer()?.listen(server.getPort());
            LoggingService.getInstance().info(
                `${server.name} - Server is running on HTTPS: https://FQDN:${server.getPort()}`
            );
        }
    }
}

async function initPlugins(): Promise<void> {
    // load registered plugins
    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
}

async function initializeFrontend(): Promise<void> {

    await createClientRegistration();

    // create initial data
    const initialDataExtensions = await PluginService.getInstance().getExtensions<IInitialDataExtension>(
        AgentPortalExtensions.INITIAL_DATA
    );
    LoggingService.getInstance().info(`Create initial data (${initialDataExtensions.length} extensions)`);
    for (const extension of initialDataExtensions) {
        await extension.createData().catch((e) => {
            LoggingService.getInstance().error(`Error creating inital data: ${extension.name}.`, e);
        });
    }

    const success = await MigrationService.getInstance().startMigration();
    if (!success) {
        LoggingService.getInstance().error('Startup failed. Could not migrate!');
        process.exit(1);
    }
}

async function buildApplications(): Promise<void> {
    const pluginDirs = [
        'frontend-applications',
        'frontend-applications/agent-portal/modules'
    ];
    await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));
    await MarkoService.getInstance().initializeMarkoApplications();
}


async function createClientRegistration(): Promise<void> {
    LoggingService.getInstance().info('Create ClientRegsitration');

    const backendToken = await AuthenticationService.getInstance().getCallbackToken();
    await ClientRegistrationService.getInstance().createClientRegistration(backendToken)
        .catch((error) => {
            LoggingService.getInstance().error(error);
            LoggingService.getInstance().error(
                'Failed to register frontent server at backend (ClientRegistration). See errors above.'
            );
            process.exit(1);
        });

    LoggingService.getInstance().info('ClientRegistration created.');
}

function initProcessListener(): void {
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
}


initializeServer();