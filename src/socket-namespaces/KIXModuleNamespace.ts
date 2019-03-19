import { SocketNameSpace } from './SocketNameSpace';
import { Socket } from 'socket.io';
import { SocketResponse, AppUtil } from '../core/common';
import {
    KIXModulesEvent, LoadKIXModulesRequest, LoadKIXModulesResponse,
    LoadFormConfigurationsRequest, LoadFormConfigurationsResponse
} from '../core/model';
import { KIXExtensions, IKIXModuleExtension } from '../core/extensions';
import { PluginService } from '../services';
import { ConfigurationService } from '../core/services';

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
    }

    private async loadModules(data: LoadKIXModulesRequest): Promise<SocketResponse<LoadKIXModulesResponse>> {

        const modules = await PluginService.getInstance().getExtensions<IKIXModuleExtension>(KIXExtensions.MODULES);

        const packageJson = require('../../package.json');
        const version = packageJson.version;
        const prePath = '/@kix/frontend$' + version + '/dist/components/';

        modules.forEach((m) => m.tags.forEach((t) => t[1] = prePath + t[1]));

        const response = new SocketResponse(
            KIXModulesEvent.LOAD_MODULES_FINISHED, new LoadKIXModulesResponse(data.requestId, modules)
        );

        return response;
    }

    private async loadFormConfigurations(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse<LoadFormConfigurationsResponse>> {
        await AppUtil.updateFormConfigurations();
        const forms = ConfigurationService.getInstance().getRegisteredForms();
        const formIdsWithContext = ConfigurationService.getInstance().getFormIDsWithContext();
        const response = new LoadFormConfigurationsResponse(data.requestId, forms, formIdsWithContext);
        return new SocketResponse(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED, response);
    }

}
