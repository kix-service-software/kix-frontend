import { ComponentRouter, KIXObjectType, ContextMode, Context } from '../../model';
import { IRoutingServiceListener } from './IRoutingServiceListener';
import { RoutingConfiguration } from './RoutingConfiguration';
import { ContextService } from '../context';
import { ContextFactory } from '../context/ContextFactory';
import { ClientStorageService } from '../ClientStorageService';
import { ReleaseContext } from '../release';
import { ObjectDataService } from '../ObjectDataService';
import { BrowserUtil } from '../BrowserUtil';

export class RoutingService {

    private static INSTANCE: RoutingService = null;

    public static getInstance(): RoutingService {
        if (!RoutingService.INSTANCE) {
            RoutingService.INSTANCE = new RoutingService();
        }

        return RoutingService.INSTANCE;
    }

    private constructor() { }

    private componentRouters: ComponentRouter[] = [];
    private serviceListener: IRoutingServiceListener[] = [];
    private routingConfigurations: RoutingConfiguration[] = [];

    public registerServiceListener(listener: IRoutingServiceListener): void {
        this.serviceListener.push(listener);
    }

    public registerRoutingConfiguration(configuration: RoutingConfiguration): void {
        this.routingConfigurations.push(configuration);
    }

    public async routeToInitialContext(history: boolean = false): Promise<void> {
        const VISITED_KEY = 'kix-18-site-visited';
        const visitedOption = ClientStorageService.getOption(VISITED_KEY);
        const objectData = ObjectDataService.getInstance().getObjectData();
        const buildNumber = objectData.releaseInfo ? objectData.releaseInfo.buildNumber : null;
        if (!visitedOption || (buildNumber && visitedOption !== buildNumber.toString())) {
            await ContextService.getInstance().setContext(
                ReleaseContext.CONTEXT_ID, KIXObjectType.ANY, ContextMode.DASHBOARD
            );
            ClientStorageService.setOption(VISITED_KEY, buildNumber.toString());
        } else {
            const parsedUrl = new URL(window.location.href);
            const path = parsedUrl.pathname === '/' ? [] : parsedUrl.pathname.split('/');
            let contextUrl = 'home';
            if (path.length > 1) {
                contextUrl = path[1];
                const objectId = path[2];

                let context: Context;
                if (contextUrl && contextUrl !== '') {
                    context = await ContextFactory.getContextForUrl(contextUrl, objectId);
                }

                if (context) {
                    await ContextService.getInstance().setContext(
                        context.getDescriptor().contextId, null,
                        context.getDescriptor().contextMode, objectId, undefined, history
                    );
                } else {
                    BrowserUtil.openAccessDeniedOverlay();
                    await this.setHomeContext();
                }
            } else {
                await this.setHomeContext();
            }

            this.handleDialogRequest(path, parsedUrl.searchParams);
        }
    }

    private async setHomeContext(): Promise<void> {
        await ContextService.getInstance().setContext('home', KIXObjectType.ANY, ContextMode.DASHBOARD);
    }

    private async handleDialogRequest(path: string[], params: URLSearchParams): Promise<void> {
        let context = null;

        const contextUrl = path[1];

        let needDialog = false;
        if (params.has('new')) {
            needDialog = true;
            const url = path.length === 4 ? path[3] : contextUrl;
            const mode = path.length === 4 ? ContextMode.CREATE_SUB : ContextMode.CREATE;
            context = await ContextFactory.getContextForUrl(url, undefined, mode);
            if (!context && mode === ContextMode.CREATE) {
                await ContextService.getInstance().setDialogContext(
                    null, null, mode, null, true
                );
            }
        } else if (params.has('edit')) {
            needDialog = true;
            context = contextUrl
                ? await ContextFactory.getContextForUrl(contextUrl, undefined, ContextMode.EDIT)
                : null;
        } else if (params.has('editLinks')) {
            needDialog = true;
            context = contextUrl
                ? await ContextFactory.getContextForUrl('links', undefined, ContextMode.EDIT_LINKS)
                : null;
        }

        if (context) {
            const descriptor = context.getDescriptor();
            await ContextService.getInstance().setDialogContext(
                descriptor.contextId, descriptor.kixObjectTypes[0], descriptor.contextMode, null, true
            );
        } else if (needDialog) {
            BrowserUtil.openAccessDeniedOverlay();
        }
    }

    public async routeToContext(routingConfiguration: RoutingConfiguration, objectId: string | number): Promise<void> {
        if (routingConfiguration) {
            ContextService.getInstance().setContext(
                routingConfiguration.contextId,
                routingConfiguration.objectType,
                routingConfiguration.contextMode,
                objectId, true, routingConfiguration.history
            );

            let url = routingConfiguration.path;
            if (!url) {
                url = await this.buildUrl(routingConfiguration, objectId);
            }

            history.replaceState(null, null, `/${url}`);
        }
    }

    public async buildUrl(routingConfiguration: RoutingConfiguration, objectId: string | number): Promise<string> {
        let url = '#';
        const descriptor = await ContextFactory.getInstance().getContextDescriptor(routingConfiguration.contextId);
        if (descriptor) {
            url = descriptor.urlPaths[0];
            if (descriptor.contextMode === ContextMode.DETAILS) {
                url += '/' + objectId;
            }
        }

        return url;
    }

    public routeTo(
        routerId: string, componentId: string, data: any, parameterValue: string = null
    ): void {
        let router = this.componentRouters.find((r) => r.routerId === routerId);
        if (!router) {
            const componentRouter = new ComponentRouter(routerId, componentId, parameterValue, data);
            this.componentRouters.push(componentRouter);
            router = componentRouter;
        }

        router.componentId = componentId;
        router.data = data;
        router.parameterValue = parameterValue;
        this.notifyListener(router);
    }


    private notifyListener(router: ComponentRouter): void {
        for (const listener of this.serviceListener) {
            listener.routedTo(router);
        }
    }

}
