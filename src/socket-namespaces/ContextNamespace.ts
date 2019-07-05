import { SocketNameSpace } from './SocketNameSpace';
import {
    ContextEvent, LoadContextConfigurationRequest, LoadContextConfigurationResponse, ContextConfiguration, SocketEvent
} from '../core/model';

import { SocketResponse, SocketErrorResponse } from '../core/common';
import { ConfigurationService } from '../core/services';
import { PluginService, PermissionService } from '../services';
import { UserService } from '../core/services/impl/api/UserService';

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
        const user = await UserService.getInstance().getUserByToken(data.token)
            .catch(() => null);
        const userId = user ? user.UserID : null;

        let configuration = ConfigurationService.getInstance().getModuleConfiguration<ContextConfiguration>(
            data.contextId, userId
        );

        if (!configuration) {
            const configurationExtension = await PluginService.getInstance().getConfigurationExtension(data.contextId)
                .catch(() => null);

            if (configurationExtension) {
                const moduleDefaultConfiguration = await configurationExtension.getDefaultConfiguration(data.token)
                    .catch(() => null);

                if (moduleDefaultConfiguration) {
                    ConfigurationService.getInstance().saveModuleConfiguration(
                        data.contextId, userId, moduleDefaultConfiguration
                    );
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
