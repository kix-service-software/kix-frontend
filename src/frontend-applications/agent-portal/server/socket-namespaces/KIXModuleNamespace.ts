/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SocketNameSpace } from "./SocketNameSpace";
import { KIXModulesEvent } from "../../modules/base-components/webapp/core/KIXModulesEvent";
import { LoadKIXModulesRequest } from "../../modules/base-components/webapp/core/LoadKIXModulesRequest";
import { SocketResponse } from "../../modules/base-components/webapp/core/SocketResponse";
import { PluginService } from "../../../../server/services/PluginService";
import { IKIXModuleExtension } from "../../model/IKIXModuleExtension";
import { LoadKIXModulesResponse } from "../../modules/base-components/webapp/core/LoadKIXModulesResponse";
import { SocketEvent } from "../../modules/base-components/webapp/core/SocketEvent";
import { SocketErrorResponse } from "../../modules/base-components/webapp/core/SocketErrorResponse";
import { LoadFormConfigurationsRequest } from "../../modules/base-components/webapp/core/LoadFormConfigurationsRequest";
import { ModuleConfigurationService } from "../services/configuration";
import { FormConfiguration } from "../../model/configuration/FormConfiguration";
import { ConfigurationType } from "../../model/configuration/ConfigurationType";
import { FormConfigurationResolver } from "../services/configuration/FormConfigurationResolver";
import { LoggingService } from "../../../../server/services/LoggingService";
import {
    LoadFormConfigurationsResponse
} from "../../modules/base-components/webapp/core/LoadFormConfigurationsResponse";
import { ISocketRequest } from "../../modules/base-components/webapp/core/ISocketRequest";
import { LoadReleaseInfoResponse } from "../../modules/base-components/webapp/core/LoadReleaseInfoResponse";
import { Socket } from "socket.io";
import { AgentPortalExtensions } from "../extensions/AgentPortalExtensions";
import { ReleaseInfoUtil } from "../../../../server/ReleaseInfoUtil";
import { KIXModuleFactory } from "../extensions/KIXModuleFactory";
import { ObjectDefinitionService } from "../services/ObjectDefinitionService";
import { LoadObjectDefinitionsResponse } from "../../modules/base-components/webapp/core/LoadObjectDefinitionsResponse";
import { LoadFormConfigurationRequest } from "../../modules/base-components/webapp/core/LoadFormConfigurationRequest";
import { LoadFormConfigurationResponse } from "../../modules/base-components/webapp/core/LoadFormConfigurationResponse";

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
        const response = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(
            AgentPortalExtensions.MODULES
        ).then(async (modules) => {
            const createPromises: Array<Promise<IKIXModuleExtension>> = [];
            for (const uiModule of modules) {
                createPromises.push(KIXModuleFactory.getInstance().create(data.token, uiModule));
            }

            const uiModules = await Promise.all(createPromises);

            return new SocketResponse(
                KIXModulesEvent.LOAD_MODULES_FINISHED,
                new LoadKIXModulesResponse(data.requestId, uiModules)
            );
        }).catch((error) => new SocketResponse(SocketEvent.ERROR, new SocketErrorResponse(data.requestId, error)));

        return response;
    }

    private async loadFormConfigurations(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse> {
        const formIdsWithContext = ModuleConfigurationService.getInstance().getFormIDsWithContext();
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
        const releaseInfo = await ReleaseInfoUtil.getReleaseInfo();
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