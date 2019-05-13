import { SocketNameSpace } from './SocketNameSpace';
import { Socket } from 'socket.io';
import { SocketResponse, AppUtil } from '../core/common';
import {
    KIXModulesEvent, LoadKIXModulesRequest, LoadKIXModulesResponse,
    LoadFormConfigurationsRequest, LoadFormConfigurationsResponse
} from '../core/model';
import { KIXExtensions, IKIXModuleExtension, KIXModuleFactory } from '../core/extensions';
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

    private loadModules(data: LoadKIXModulesRequest): Promise<SocketResponse<LoadKIXModulesResponse>> {

        return new Promise<SocketResponse<LoadKIXModulesResponse>>((resolve, reject) => {
            PluginService.getInstance().getExtensions<IKIXModuleExtension>(KIXExtensions.MODULES)
                .then(async (modules) => {
                    const createPromises: Array<Promise<IKIXModuleExtension>> = [];
                    for (const uiModule of modules) {
                        createPromises.push(KIXModuleFactory.getInstance().create(data.token, uiModule));
                    }

                    const uiModules = await Promise.all(createPromises);

                    resolve(
                        new SocketResponse(
                            KIXModulesEvent.LOAD_MODULES_FINISHED,
                            new LoadKIXModulesResponse(data.requestId, uiModules)
                        )
                    );
                });
        });
    }

    private loadFormConfigurations(
        data: LoadFormConfigurationsRequest
    ): Promise<SocketResponse<LoadFormConfigurationsResponse>> {
        return new Promise<SocketResponse<LoadFormConfigurationsResponse>>((resolve, reject) => {
            AppUtil.updateFormConfigurations().then(() => {
                const forms = ConfigurationService.getInstance().getRegisteredForms();
                const formIdsWithContext = ConfigurationService.getInstance().getFormIDsWithContext();
                const response = new LoadFormConfigurationsResponse(data.requestId, forms, formIdsWithContext);
                resolve(new SocketResponse(KIXModulesEvent.LOAD_FORM_CONFIGURATIONS_FINISHED, response));
            });
        });

    }

}
