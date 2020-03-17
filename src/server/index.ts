/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import path = require('path');
import { ConfigurationService } from './services/ConfigurationService';
import { PluginService } from './services/PluginService';
import { IFrontendServerExtension } from './model/IFrontendServerExtension';
import { ServerExtensions } from './model/ServerExtensions';
import { LoggingService } from './services/LoggingService';

process.setMaxListeners(0);

class Startup {

    public constructor() {
        this.initApplication();
    }

    private async initApplication(): Promise<void> {
        const configDir = path.join(__dirname, '..', '..', 'config');
        const certDir = path.join(__dirname, '..', '..', 'cert');
        ConfigurationService.getInstance().init(configDir, certDir);

        const pluginDirs = [
            'frontend-applications',
            'frontend-applications/agent-portal/modules',
            'plugins'
        ];
        PluginService.getInstance().init(pluginDirs.map((pd) => path.join('..', pd)));

        const serverExtensions = await PluginService.getInstance().getExtensions<IFrontendServerExtension>(
            ServerExtensions.APPLICATION_SERVER
        );

        LoggingService.getInstance().info(`Found ${serverExtensions.length} server extensions.`);

        for (const extension of serverExtensions) {
            LoggingService.getInstance().info(`Start Extension: ${extension.name}`);
            const server = extension.getServer();
            try {
                await server.initServer();
            } catch (error) {
                LoggingService.getInstance().error(`Could not initialize server extension ${extension.name}`);
                LoggingService.getInstance().error(error);
            }
        }

    }

}

const startup = new Startup();
