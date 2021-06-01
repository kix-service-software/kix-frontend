/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentRouter } from '../../../../model/ComponentRouter';
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

    private componentRouters: ComponentRouter[] = [];

    public async routeToInitialContext(history: boolean = false, useURL: boolean = true): Promise<void> {
        await ContextService.getInstance().initUserContextInstances();
        const contextList = ContextService.getInstance().getContextInstances();
        if (contextList.length) {
            await ContextService.getInstance().setContextByInstanceId(contextList[0].instanceId);
        }

        if (useURL) {
            await this.routeToURL(history);
        }

        this.setHomeContext();
        await this.setReleaseContext();
        await SetupService.getInstance().setSetupAssistentIfNeeded();
    }

    private async setReleaseContext(): Promise<void> {
        const needReleaseInfo = await this.isReleaseInfoNeeded();
        if (needReleaseInfo) {
            await ContextService.getInstance().setActiveContext('release');

            const releaseInfo = await KIXModulesSocketClient.getInstance().loadReleaseConfig();
            const buildNumber = releaseInfo ? releaseInfo.buildNumber : null;
            AgentService.getInstance().setPreferences([
                [this.VISITED_KEY, buildNumber.toString()]
            ]);
        }
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

    private setHomeContext(): void {
        const contextList = ContextService.getInstance().getContextInstances();
        if (Array.isArray(contextList) && !contextList.length) {
            ContextService.getInstance().setActiveContext('home');
        }
    }

    private async routeToURL(history: boolean = false): Promise<void> {
        const parsedUrl = new URL(window.location.href);
        const path = parsedUrl.pathname === '/' ? [] : parsedUrl.pathname.split('/');
        if (path.length > 1) {
            const contextUrl = path[1];
            const objectId = path[2];
            if (contextUrl && contextUrl !== '') {
                await ContextService.getInstance().setContextByUrl(contextUrl, objectId);
            }
        }

        this.handleURLParams(parsedUrl.searchParams);
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
