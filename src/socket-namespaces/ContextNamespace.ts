/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import {
    ContextEvent, LoadContextConfigurationRequest, LoadContextConfigurationResponse, ContextConfiguration, SocketEvent
} from '../core/model';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import { ConfigurationService } from '../core/services';
import { PluginService, PermissionService } from '../services';

export class ContextNamespace extends SocketNameSpace {

    private static INSTANCE: ContextNamespace;

    public static getInstance(): ContextNamespace {
        if (!ContextNamespace.INSTANCE) {
            ContextNamespace.INSTANCE = new ContextNamespace();
        }
        return ContextNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'context';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(
            client, ContextEvent.LOAD_CONTEXT_CONFIGURATION, this.loadContextConfiguration.bind(this)
        );
    }

    protected async loadContextConfiguration(
        data: LoadContextConfigurationRequest
    ): Promise<SocketResponse<LoadContextConfigurationResponse<any> | SocketErrorResponse>> {
        let configuration = ConfigurationService.getInstance().getConfiguration<ContextConfiguration>(data.contextId);

        if (!configuration) {
            const configurationExtension = await PluginService.getInstance().getConfigurationExtension(data.contextId)
                .catch(() => null);

            if (configurationExtension) {
                const moduleDefaultConfiguration = await configurationExtension.getDefaultConfiguration(data.token)
                    .catch(() => null);

                if (moduleDefaultConfiguration) {
                    ConfigurationService.getInstance().saveConfiguration(data.contextId, moduleDefaultConfiguration);
                    configuration = moduleDefaultConfiguration;
                } else {
                    return new SocketResponse(
                        SocketEvent.ERROR,
                        new SocketErrorResponse(
                            data.requestId,
                            new Error(`No default configuration for context ${data.contextId} given!`)
                        )
                    );
                }
            } else {
                return new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(
                    data.requestId, `No configuration extension for context ${data.contextId} available.`
                ));
            }
        }

        configuration.contextId = data.contextId;
        configuration = await PermissionService.getInstance().filterContextConfiguration(data.token, configuration)
            .catch(() => configuration);

        const response = new LoadContextConfigurationResponse(data.requestId, configuration);
        return new SocketResponse(ContextEvent.CONTEXT_CONFIGURATION_LOADED, response);

    }

}
