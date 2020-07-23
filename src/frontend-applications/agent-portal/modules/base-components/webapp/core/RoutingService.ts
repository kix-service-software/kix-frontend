/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentRouter } from '../../../../model/ComponentRouter';
import { IRoutingServiceListener } from './IRoutingServiceListener';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { KIXModulesSocketClient } from './KIXModulesSocketClient';
import { ContextService } from './ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { Context } from 'vm';
import { ContextFactory } from './ContextFactory';
import { BrowserUtil } from './BrowserUtil';
import { ActionFactory } from './ActionFactory';
import { EventService } from './EventService';
import { ApplicationEvent } from './ApplicationEvent';

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
        const VISITED_KEY = 'KIXWebFrontendVisitedVersion';

        let visited: string;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser && currentUser.Preferences) {
            const vistedVersion = currentUser.Preferences.find((p) => p.ID === VISITED_KEY);
            visited = vistedVersion ? vistedVersion.Value : null;
        }

        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
        if (!visited || (buildNumber && visited !== buildNumber.toString())) {
            await ContextService.getInstance().setContext(
                'release', KIXObjectType.ANY, ContextMode.DASHBOARD
            );
            AgentService.getInstance().setPreferences([
                [VISITED_KEY, buildNumber.toString()]
            ]);
        } else {
            const parsedUrl = new URL(window.location.href);
            const path = parsedUrl.pathname === '/' ? [] : parsedUrl.pathname.split('/');
            if (path.length > 1) {
                const contextUrl = path[1];
                const objectId = path[2];

                let context: Context;
                if (contextUrl && contextUrl !== '') {
                    context = await ContextFactory.getContextForUrl(contextUrl, objectId);
                }

                if (context) {
                    await ContextService.getInstance().setContext(
                        context.getDescriptor().contextId, null,
                        context.getDescriptor().contextMode, objectId, undefined, history, false, true
                    );
                } else {
                    if (contextUrl !== 'login') {
                        BrowserUtil.openAccessDeniedOverlay();
                    }
                    await this.setHomeContext();
                }
            } else {
                await this.setHomeContext();
            }

            this.handleRequest(parsedUrl.searchParams);
        }
    }

    private async setHomeContext(): Promise<void> {
        await ContextService.getInstance().setContext(
            'home', KIXObjectType.ANY, ContextMode.DASHBOARD, null, null, null, false, true
        );
    }

    private handleRequest(params: URLSearchParams): void {
        setTimeout(async () => {
            if (params.has('new')) {
                await ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE, null, true);
            } else if (params.has('actionId')) {
                const actionId = params.get('actionId');
                const data = params.get('data');
                const actions = await ActionFactory.getInstance().generateActions([actionId], data);
                if (actions && actions.length) {
                    actions[0].run(null);
                }
            }
        }, 2500);
    }

    public async routeToContext(
        routingConfiguration: RoutingConfiguration, objectId: string | number, addHistory: boolean = true,
        reset: boolean = true
    ): Promise<void> {
        if (routingConfiguration) {
            EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);

            await ContextService.getInstance().setContext(
                routingConfiguration.contextId,
                routingConfiguration.objectType,
                routingConfiguration.contextMode,
                objectId, reset, routingConfiguration.history,
                addHistory
            );
        }
    }

    public async buildUrl(routingConfiguration: RoutingConfiguration, objectId: string | number): Promise<string> {
        let url;
        const descriptor = ContextFactory.getInstance().getContextDescriptor(routingConfiguration.contextId);
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
