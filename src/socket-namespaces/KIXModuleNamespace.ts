import { SocketNameSpace } from './SocketNameSpace';
import { Socket } from 'socket.io';
import { SocketResponse, AppUtil } from '../core/common';
import {
    KIXModulesEvent, LoadKIXModulesRequest, LoadKIXModulesResponse,
    LoadFormConfigurationsRequest, LoadFormConfigurationsResponse,
    LoadBookmarksResponse, ISocketRequest, LoadReleaseInfoResponse, LoadObjectDefinitionsResponse
} from '../core/model';
import { KIXExtensions, IKIXModuleExtension, KIXModuleFactory } from '../core/extensions';
import { PluginService } from '../services';
import { ConfigurationService, ObjectDefinitionService } from '../core/services';

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

        this.registerEventHandler(client, KIXModulesEvent.LOAD_BOOKMARKS,
            this.loadBookmarks.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_RELEASE_INFO,
            this.loadReleaseInfo.bind(this));

        this.registerEventHandler(client, KIXModulesEvent.LOAD_OBJECT_DEFINITIONS,
            this.loadObjectDefinitions.bind(this));
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

    private loadBookmarks(data: ISocketRequest): Promise<SocketResponse<LoadBookmarksResponse>> {
        return new Promise<SocketResponse<LoadBookmarksResponse>>((resolve, reject) => {
            const bookmarks = ConfigurationService.getInstance().getBookmarks();
            resolve(new SocketResponse(
                KIXModulesEvent.LOAD_BOOKMARKS_FINISHED, new LoadBookmarksResponse(data.requestId, bookmarks)
            ));
        });
    }

    private loadReleaseInfo(data: ISocketRequest): Promise<SocketResponse<LoadReleaseInfoResponse>> {
        return new Promise<SocketResponse<LoadReleaseInfoResponse>>(async (resolve, reject) => {
            const releaseInfo = await ConfigurationService.getInstance().getModuleConfiguration('release-info', null);
            resolve(new SocketResponse(
                KIXModulesEvent.LOAD_RELEASE_INFO_FINISHED, new LoadReleaseInfoResponse(data.requestId, releaseInfo)
            ));
        });
    }

    private loadObjectDefinitions(data: ISocketRequest): Promise<SocketResponse<LoadObjectDefinitionsResponse>> {
        return new Promise<SocketResponse<LoadObjectDefinitionsResponse>>(async (resolve, reject) => {
            const objectDefinitions = await ObjectDefinitionService.getInstance().getObjectDefinitions(data.token)
                .catch(() => []);

            resolve(
                new SocketResponse(
                    KIXModulesEvent.LOAD_OBJECT_DEFINITIONS_FINISHED,
                    new LoadObjectDefinitionsResponse(data.requestId, objectDefinitions)
                )
            );
        });
    }
}
