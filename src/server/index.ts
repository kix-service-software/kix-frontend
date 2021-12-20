/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationService } from './services/ConfigurationService';
import { PluginService } from './services/PluginService';
import { LoggingService } from './services/LoggingService';
import { Server } from '../frontend-applications/agent-portal/server/Server';

process.setMaxListeners(0);

class Startup {

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        const path = require('path');
        const configDir = path.join(__dirname, '..', '..', 'config');
        const certDir = path.join(__dirname, '..', '..', 'cert');
        const dataDir = path.join(__dirname, '..', '..', 'data');
        ConfigurationService.getInstance().init(configDir, certDir, dataDir);

        LoggingService.getInstance().info('[SERVER] Start');

        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules'
        ];
        await PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

        try {
            const startUpBegin = Date.now();
            await Server.getInstance().initServer();
            const startUpEnd = Date.now();
            LoggingService.getInstance().info(`[SERVER] Ready - Startup in ${(startUpEnd - startUpBegin) / 1000}s`);
        } catch (error) {
            LoggingService.getInstance().error('Could not initialize server');
            LoggingService.getInstance().error(error);
        }
    }
}

const startup = new Startup();
LoggingService.getInstance().info('Startup Server', startup);
