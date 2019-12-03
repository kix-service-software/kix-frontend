/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from './SocketNameSpace';
import { Socket } from 'socket.io';
import { SocketResponse, SocketErrorResponse } from '../core/common';
import {
    KIXModulesEvent, LoadKIXModulesRequest, LoadKIXModulesResponse,
    LoadFormConfigurationsRequest, LoadFormConfigurationsResponse,
    ISocketRequest, LoadReleaseInfoResponse, LoadObjectDefinitionsResponse, SocketEvent
} from '../core/model';
import { KIXExtensions, IKIXModuleExtension, KIXModuleFactory } from '../core/extensions';
import { PluginService, ModuleConfigurationService } from '../services';
import { ConfigurationService, ObjectDefinitionService, LoggingService } from '../core/services';
import { ConfigurationType } from '../core/model/configuration';
import { FormConfiguration } from '../core/model/components/form/configuration';
import { FormConfigurationResolver } from '../services/configuration/FormConfigurationResolver';
import { Server } from '../Server';
import { LoadFormConfigurationRequest } from '../core/model/socket/application/LoadFormConfigurationRequest';
import { LoadFormConfigurationResponse } from '../core/model/socket/application/LoadFormConfigurationResponse';

export class KIXModuleNamespace extends SocketNameSpace {

    private static INSTANCE: KIXModuleNamespace;

    public static getInstance(): KIXModuleNamespace {
        if (!KIXModuleNamespace.INSTANCE) {
            KIXModuleNamespace.INSTANCE = new KIXModuleNamespace();
        }
        return KIXModuleNamespace.INSTANCE;
    }

    private constructor() {
        super();
    }

    protected getNamespace(): string {
        return 'kixmodules';
    }

    protected registerEvents(client: Socket): void {
        this.registerEventHandler(client, KIXModulesEvent.LOAD_MODULES, this.loadModules.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_FORM_CONFIGURATIONS,
            this.loadFormConfigurations.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_FORM_CONFIGURATION,
            this.loadFormConfiguration.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_RELEASE_INFO,
            this.loadReleaseInfo.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_OBJECT_DEFINITIONS,
            this.loadObjectDefinitions.bind(this));
    }

    private async loadModules(data: LoadKIXModulesRequest): Promise<SocketResponse> {
        const response = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(KIXExtensions.MODULES)
            .then(async (modules) => {
                const createPromises: Array<Promise<IKIXModuleExtension>> = [];
                for (const uiModule of modules) {
                    createPromises.push(KIXModuleFactory.getInstance().create(data.token, uiModule));
                }

                const uiModules = await Promise.all(createPromises);

                return new SocketResponse(
                    KIXModulesEvent.LOAD_MODULES_FINISHED,
                    new LoadKIXModulesResponse(data.requestId, uiModules)
                );
            })
            .catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async loadFormConfigurations(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse> {
        const formIdsWithContext = ConfigurationService.getInstance().getFormIDsWithContext();
        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED,
            new LoadFormConfigurationsResponse(data.requestId, formIdsWithContext)
        );
    }

    private async loadFormConfiguration(
        data: LoadFormConfigurationRequest
    ): Promise<SocketResponse> {
        const form = await ModuleConfigurationService.getInstance().loadConfiguration<FormConfiguration>(
            data.token, data.formId
        );

        await FormConfigurationResolver.resolve(data.token, form)
            .catch((error) => {
                LoggingService.getInstance().error(error);
                LoggingService.getInstance().warning('Could not resolve form configuration ' + form.id);
            });

        return new SocketResponse(
            KIXModulesEvent.LOAD_FORM_CONFIGURATION_FINISHED,
            new LoadFormConfigurationResponse(data.requestId, form)
        );
    }

    private async loadReleaseInfo(data: ISocketRequest): Promise<SocketResponse<LoadReleaseInfoResponse>> {
        const releaseInfo = await Server.getInstance().getReleaseInformation();
        return new SocketResponse(
            KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, new LoadReleaseInfoResponse(data.requestId, releaseInfo)
        );
    }

    private async loadObjectDefinitions(data: ISocketRequest): Promise<SocketResponse> {
        const objectDefinitions = await ObjectDefinitionService.getInstance().getObjectDefinitions(data.token)
            .catch(() => []);

        return new SocketResponse(
            KIXModulesEvent.LOAD_OBJECT_DEFINITIONS_FINISHED,
            new LoadObjectDefinitionsResponse(data.requestId, objectDefinitions)
        );
    }
}
