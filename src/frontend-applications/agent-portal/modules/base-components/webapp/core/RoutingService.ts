/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentService } from '../../../user/webapp/core/AgentService';
import { KIXModulesSocketClient } from './KIXModulesSocketClient';
import { ContextService } from './ContextService';
import { ActionFactory } from './ActionFactory';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { ContextMode } from '../../../../model/ContextMode';
import { KIXModulesService } from './KIXModulesService';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { BrowserUtil } from './BrowserUtil';

export class RoutingService {

    private static INSTANCE: RoutingService = null;

    private VISITED_KEY = 'KIXWebFrontendVisitedVersion';

    public static getInstance(): RoutingService {
        if (!RoutingService.INSTANCE) {
            RoutingService.INSTANCE = new RoutingService();
        }

        return RoutingService.INSTANCE;
    }

    private constructor() { }

    public async routeToInitialContext(
        history: boolean = false, useURL: boolean = true, defaultContextId?: string
    ): Promise<void> {
        await ContextService.getInstance().initUserContextInstances();

        let routed: boolean = false;
        if (useURL) {
            routed = await this.routeToURL(history);
        }

        routed = await this.setReleaseContext() || routed;
        routed = await SetupService.getInstance().setSetupAssistentIfNeeded() || routed;

        if (!routed) {
            const contextList = ContextService.getInstance().getContextInstances();
            if (contextList.length) {
                await ContextService.getInstance().setContextByInstanceId(contextList[0].instanceId);
            } else {
                this.setHomeContextIfNeeded(defaultContextId);
            }
        }
    }

    public async routeTo(routingConfiguration: RoutingConfiguration, objectId: string | number): Promise<void> {
        if (routingConfiguration) {
            const urlParams = routingConfiguration?.params;
            let urlSearchParams;
            if (Array.isArray(urlParams) && urlParams.length) {
                const encodedParams = [];
                for (const p of urlParams) {
                    const value = await BrowserUtil.prepareUrlParameterValue(p[1]);
                    encodedParams.push([p[0], value]);
                }
                urlSearchParams = new URLSearchParams(encodedParams);
            }

            ContextService.getInstance().setActiveContext(
                routingConfiguration?.contextId, objectId, urlSearchParams,
                routingConfiguration?.additionalInformation
            );
        }
    }

    private async setReleaseContext(): Promise<boolean> {
        let routed: boolean = false;

        const needReleaseInfo = await this.isReleaseInfoNeeded();
        if (needReleaseInfo) {
            await ContextService.getInstance().setActiveContext('release');

            const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
            const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
            AgentService.getInstance().setPreferences([
                [this.VISITED_KEY, buildNumber.toString()]
            ]);
            routed = true;
        }

        return routed;
    }

    private async isReleaseInfoNeeded(): Promise<boolean> {
        let releaseInfoVisited: string;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser && currentUser.Preferences) {
            const vistedVersion = currentUser.Preferences.find((p) => p.ID === this.VISITED_KEY);
            releaseInfoVisited = vistedVersion ? vistedVersion.Value : null;
        }

        const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
        const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
        return !releaseInfoVisited || (buildNumber && releaseInfoVisited !== buildNumber.toString());
    }

    private setHomeContextIfNeeded(defaultContextId: string = 'home'): boolean {
        let routed: boolean = false;
        const contextList = ContextService.getInstance().getContextInstances();
        if (Array.isArray(contextList) && !contextList.length) {
            ContextService.getInstance().setActiveContext(defaultContextId);
            routed = true;
        }

        return routed;
    }

    public async routeToURL(history: boolean = false): Promise<boolean> {
        let routed: boolean = false;
        const parsedUrl = new URL(window.location.href);
        const urlParams = parsedUrl.searchParams;

        const prefixLength = KIXModulesService.urlPrefix.length;
        const pathName = parsedUrl.pathname.substring(prefixLength + 1, parsedUrl.pathname.length);
        const path = parsedUrl.pathname === '/' ? [] : pathName.split('/');

        let contextUrl: string;
        let objectId: string;

        if (path.length > 1) {
            contextUrl = path[0];
            objectId = path[1];
        }

        if (contextUrl && contextUrl !== '') {
            routed = await this.handleURLParams(urlParams, contextUrl);

            if (!routed) {
                const context = await ContextService.getInstance().setContextByUrl(
                    contextUrl, objectId, urlParams, history
                );
                if (context) {
                    routed = true;
                }
            }
        }

        return routed;
    }

    private async handleURLParams(params: URLSearchParams, contextId?: string): Promise<boolean> {
        const result = await new Promise<boolean>(async (resolve, reject) => {
            if (params.has('new')) {

                const contextDescriptors = ContextService.getInstance().getContextDescriptors(
                    ContextMode.CREATE
                );

                const contextDescriptor = contextDescriptors.find(
                    (c) => c.urlPaths.some((url) => url === contextId)
                );

                await ContextService.getInstance().setActiveContext(contextDescriptor?.contextId, null, params);

                resolve(true);
            } else if (params.has('actionId')) {
                await ContextService.getInstance().setActiveContext(contextId);
                const actionId = params.get('actionId');
                const data = params.get('data');
                const actions = await ActionFactory.getInstance().generateActions([actionId], data);
                if (actions && actions.length) {
                    actions[0].run(null);
                }
                resolve(true);
            } else {
                resolve(false);
            }
        });
        return result;
    }
}
