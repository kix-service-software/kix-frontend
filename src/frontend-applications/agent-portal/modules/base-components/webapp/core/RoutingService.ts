/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public async routeToInitialContext(history: boolean = false, useURL: boolean = true): Promise<void> {
        await ContextService.getInstance().initUserContextInstances();

        let routed: boolean = false;
        if (useURL) {
            routed = await this.routeToURL(history);
        }

        routed = routed || await this.setReleaseContext();
        routed = routed || await SetupService.getInstance().setSetupAssistentIfNeeded();

        if (!routed) {
            const contextList = ContextService.getInstance().getContextInstances();
            if (contextList.length) {
                await ContextService.getInstance().setContextByInstanceId(contextList[0].instanceId);
            } else {
                this.setHomeContextIfNeeded();
            }
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

    private setHomeContextIfNeeded(): boolean {
        let routed: boolean = false;
        const contextList = ContextService.getInstance().getContextInstances();
        if (Array.isArray(contextList) && !contextList.length) {
            ContextService.getInstance().setActiveContext('home');
            routed = true;
        }

        return routed;
    }

    private async routeToURL(history: boolean = false): Promise<boolean> {
        let routed: boolean = false;
        const parsedUrl = new URL(window.location.href);
        const urlParams = parsedUrl.searchParams;
        const path = parsedUrl.pathname === '/' ? [] : parsedUrl.pathname.split('/');
        if (path.length > 1) {
            const contextUrl = path[1];
            const objectId = path[2];
            if (contextUrl && contextUrl !== '') {
                await ContextService.getInstance().setContextByUrl(contextUrl, objectId, urlParams);
                routed = true;
            }
        }

        this.handleURLParams(parsedUrl.searchParams);

        return routed;
    }

    private handleURLParams(params: URLSearchParams): void {
        setTimeout(async () => {
            if (params.has('new')) {
                // await ContextService.getInstance().setDialogContext(null, null, ContextMode.CREATE);
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
}
