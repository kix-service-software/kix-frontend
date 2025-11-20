/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from './ContextService';
import { ActionFactory } from './ActionFactory';
import { ContextMode } from '../../../../model/ContextMode';
import { KIXModulesService } from './KIXModulesService';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { BrowserUtil } from './BrowserUtil';
import { AdditionalRoutingHandler } from './AdditionalRoutingHandler';
import { ClientStorageService } from './ClientStorageService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';

export class RoutingService {

    private static INSTANCE: RoutingService = null;

    public static getInstance(): RoutingService {
        if (!RoutingService.INSTANCE) {
            RoutingService.INSTANCE = new RoutingService();
        }

        return RoutingService.INSTANCE;
    }

    private constructor() { }

    private additionalRoutingHandler: AdditionalRoutingHandler[] = [];

    public registerRoutingHandler(routingHandler: AdditionalRoutingHandler): void {
        this.additionalRoutingHandler.push(routingHandler);
    }

    public async routeToInitialContext(
        history: boolean = false, useURL: boolean = true, defaultContextId?: string
    ): Promise<void> {
        await ContextService.getInstance().initUserContextInstances();

        let routed: boolean = false;
        if (useURL) {
            routed = await this.routeToURL(history);
        }

        const routingHandler = this.additionalRoutingHandler.sort((a, b) => a.priority - b.priority);
        for (const handler of routingHandler) {
            routed = await handler.handleRouting() || routed;
        }

        if (!routed) {
            const contextList = ContextService.getInstance().getContextInstances();
            if (contextList.length) {
                await ContextService.getInstance().setContextByInstanceId(contextList[0].instanceId);
            } else {
                await this.setHomeContextIfNeeded(defaultContextId);
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
                routingConfiguration?.additionalInformation, undefined, routingConfiguration?.removeCurrent
            );
        }
    }

    private async setHomeContextIfNeeded(defaultContextId: string = 'home'): Promise<boolean> {
        let routed: boolean = false;
        const contextList = ContextService.getInstance().getContextInstances();
        if (Array.isArray(contextList) && !contextList.length) {
            const url = await AgentService.getInstance().getUserPreference(PersonalSettingsProperty.INITIAL_SITE_URL);
            if (url?.Value) {
                const urlParts = url.Value?.split('?');
                if (urlParts.length) {
                    const path = urlParts[0].split('/');
                    const urlParams = new URLSearchParams(urlParts.length > 1 ? urlParts[1] : '');
                    const context = await ContextService.getInstance().setContextByUrl(
                        path[0], path[1], urlParams, false
                    );
                    if (context) {
                        ContextService.getInstance().DEFAULT_FALLBACK_CONTEXT_URL = url?.Value;
                        routed = true;
                    }
                }
            }

            if (!routed) {
                ContextService.getInstance().setActiveContext(defaultContextId);
                routed = true;
            }
        }

        return routed;
    }

    public async routeToURL(history: boolean = false, url?: string): Promise<boolean> {
        let routed: boolean = false;
        const parsedUrl = new URL(url || window.location.href);
        const urlParams = parsedUrl.searchParams;

        const prefixLength = KIXModulesService.urlPrefix.length;
        const pathName = parsedUrl.pathname.substring(prefixLength + 1, parsedUrl.pathname.length);
        let path = parsedUrl.pathname === '/' ? [] : this.removeEmptyPaths(pathName.split('/'));

        let contextUrl: string;
        let objectId: string;

        const baseRoute = this.removeEmptyPaths(ClientStorageService.getBaseRoute().split('/'));
        path.splice(0, baseRoute?.length);

        if (path.length) {
            contextUrl = path[0];
            objectId = path[1];
        }

        if (contextUrl && contextUrl !== '') {
            routed = await this.handleURLParams(urlParams, contextUrl, history);

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

    private removeEmptyPaths(path: string[]): string[] {
        path.forEach((p, i) => {
            if (!p) {
                path.splice(i, 1);
            }
        });
        return path;
    }

    private async handleURLParams(
        params: URLSearchParams, contextId?: string, history: boolean = true
    ): Promise<boolean> {
        let result = false;

        if (params.has('new')) {

            const contextDescriptors = ContextService.getInstance().getContextDescriptors(
                ContextMode.CREATE
            );

            const contextDescriptor = contextDescriptors.find(
                (c) => c.urlPaths.some((url) => url === contextId)
            );

            await ContextService.getInstance().setActiveContext(
                contextDescriptor?.contextId, null, params, [], history
            );

            result = true;
        } else if (params.has('actionId')) {
            await ContextService.getInstance().setActiveContext(contextId);
            const actionId = params.get('actionId');
            const data = params.get('data');
            const actions = await ActionFactory.getInstance().generateActions([actionId], data);
            if (actions && actions.length) {
                actions[0].run(null);
            }
            result = true;
        }

        return result;
    }

    public static getObjectId(object: KIXObject, routingConfiguration: RoutingConfiguration): string {
        let objectId;
        if (object) {
            const objPath = routingConfiguration?.objectIdProperty?.split('.') || [];
            objectId = object;
            for (const key of objPath) {
                objectId = objectId[key];
            }
        }
        return objectId;
    }
}
