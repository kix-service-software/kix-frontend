/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IContextServiceListener } from './IContextServiceListener';
import { ContextType } from '../../../../model/ContextType';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { BrowserHistoryState } from './BrowserHistoryState';
import { ContextHistory } from './ContextHistory';
import { ContextHistoryEntry } from './ContextHistoryEntry';
import { ContextSocketClient } from './ContextSocketClient';
import { Context } from '../../../../model/Context';
import { ContextExtension } from '../../../../model/ContextExtension';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';
import { ContextEvents } from './ContextEvents';
import { EventService } from './EventService';
import { BrowserUtil } from './BrowserUtil';
import { ContextPreference } from '../../../../model/ContextPreference';
import { RoutingEvent } from './RoutingEvent';
import { ConfiguredWidget } from '../../../../model/configuration/ConfiguredWidget';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { PersonalSettingsProperty } from '../../../user/model/PersonalSettingsProperty';
import { ContextConfiguration } from '../../../../model/configuration/ContextConfiguration';
import { AdditionalContextInformation } from './AdditionalContextInformation';
import { ApplicationEvent } from './ApplicationEvent';
import { KIXModulesService } from './KIXModulesService';
import { ToolbarAction } from '../../../agent-portal/webapp/application/_base-template/personal-toolbar/ToolbarAction';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';

export class ContextService {

    private static INSTANCE: ContextService = null;

    public static getInstance(): ContextService {
        if (!ContextService.INSTANCE) {
            ContextService.INSTANCE = new ContextService();
        }

        return ContextService.INSTANCE;
    }

    private constructor() { }

    private contextDescriptorList: ContextDescriptor[] = [];
    private contextInstances: Context[] = [];
    private contextCreatePromises: Map<string, Promise<Context>> = new Map();

    private serviceListener: Map<string, IContextServiceListener> = new Map();
    private activeContext: Context;
    private activeContextIndex: number;
    private contextExtensions: Map<string, Array<new () => ContextExtension>> = new Map();

    private storedContexts: ContextPreference[];
    private storageProcessQueue: Array<Promise<boolean>> = [];

    public DEFAULT_FALLBACK_CONTEXT: string = 'home';

    private toolbarActions: Map<string, ToolbarAction> = new Map();

    public registerContext(contextDescriptor: ContextDescriptor): void {
        if (!this.contextDescriptorList.some((d) => d.contextId === contextDescriptor.contextId)) {
            this.contextDescriptorList.push(contextDescriptor);
            this.serviceListener.forEach((l) => l.contextRegistered(contextDescriptor));
        }
    }

    public async initUserContextInstances(): Promise<void> {
        const contextList = await this.getStoredContextList();
        for (const c of contextList) {
            await this.createStoredContext(c);
        }
    }

    private async createStoredContext(contextPreference: ContextPreference): Promise<void> {
        if (contextPreference) {
            const context = await this.createContext(
                contextPreference.contextId, contextPreference.objectId, contextPreference.instanceId,
                contextPreference
            );
            EventService.getInstance().publish(ContextEvents.CONTEXT_CHANGED, context);
        }
    }

    public getContextDescriptors(contextMode: ContextMode): ContextDescriptor[] {
        return this.contextDescriptorList
            .filter((cd) => cd.contextMode === contextMode)
            .sort((a, b) => a.priority - b.priority);
    }

    public getContextDescriptor(contextId: string): ContextDescriptor {
        return this.contextDescriptorList.find((d) => d.contextId === contextId);
    }

    public getContext<T extends Context = Context>(instanceId: string): T {
        return this.contextInstances.find((i) => i.instanceId === instanceId) as T;
    }

    private async getContextInstance(
        contextId: string, objectId?: string | number, additionalInformation: Array<[string, any]> = [],
        urlParams?: URLSearchParams
    ): Promise<Context> {
        let context = this.contextInstances.find((c) => c.equals(contextId, objectId));

        const multiContextModes = [
            ContextMode.SEARCH,
            ContextMode.CREATE, ContextMode.CREATE_ADMIN, ContextMode.CREATE_LINK, ContextMode.CREATE_SUB
        ];

        const allowMultiple = multiContextModes.some((cm) => cm === context?.descriptor?.contextMode);

        if (!context || allowMultiple) {
            context = await this.createContextInstance(
                contextId, objectId, undefined, urlParams, additionalInformation
            ).catch((): Context => null);

            if (this.isStorableDialogContext(context)) {
                await this.updateStorage(context?.instanceId);
            }
        } else if (urlParams) {
            await context.update(urlParams);
        }
        return context;
    }

    private isStorableDialogContext(context: Context): boolean {
        return context?.descriptor?.contextType === ContextType.DIALOG
            && context?.descriptor?.storeable;
    }

    public getContextInstances(type?: ContextType, mode?: ContextMode): Context[] {
        let instances = this.contextInstances;

        if (type) {
            instances = instances.filter((c) => c.descriptor.contextType === type);
        }

        if (mode) {
            instances = instances.filter((c) => c.descriptor.contextMode === mode);
        }

        return instances;
    }

    public getActiveContext<T extends Context = Context>(): T {
        return this.activeContext as T;
    }

    public hasContextInstance(contextId: string, objectId?: string | number): boolean {
        return this.contextInstances.some(
            (c) => c.contextId === contextId && c.getObjectId()?.toString() === objectId?.toString()
        );
    }

    public async createContext(
        contextId: string, objectId: string | number, instanceId?: string,
        contextPreference?: ContextPreference
    ): Promise<Context> {
        let context = this.contextInstances.find(
            (c) => c.instanceId === instanceId || c.equals(contextId, objectId)
        );
        if (!context) {
            context = await this.createContextInstance(
                contextId, objectId, instanceId, null, null, contextPreference).catch((): Context => null);
        }

        return context;
    }

    public async removeContext(
        instanceId: string, targetContextId?: string, targetObjectId?: string | number,
        switchToTarget: boolean = true, silent?: boolean, force?: boolean
    ): Promise<boolean> {
        let removed = false;
        if (force || this.canRemove(instanceId)) {
            const confirmed = await this.checkDialogConfirmation(instanceId, silent);

            if (confirmed) {
                let sourceContext: any;
                let useSourceContext: boolean;

                const index = this.contextInstances.findIndex((c) => c.instanceId === instanceId);
                if (index !== -1) {

                    sourceContext = this.contextInstances[index].getAdditionalInformation(
                        AdditionalContextInformation.SOURCE_CONTEXT
                    );

                    useSourceContext = this.contextInstances[index].getAdditionalInformation(
                        'USE_SOURCE_CONTEXT'
                    );

                    const isStored = await this.isContextStored(instanceId);
                    if (isStored) {
                        this.updateStorage(instanceId, true);
                    }
                    const context = this.contextInstances.splice(index, 1)[0];

                    if (context) {
                        const iter = this.serviceListener.values();
                        let entry = iter.next();
                        while (entry.value) {
                            const listener = entry.value as IContextServiceListener;
                            await listener.beforeDestroy(context);
                            entry = iter.next();
                        }

                        for (const extension of context?.contextExtensions) {
                            await extension?.destroy(context);
                        }

                        await context?.destroy();
                        EventService.getInstance().publish(ContextEvents.CONTEXT_REMOVED, context);
                    }

                    this.activeContextIndex--;

                    if (switchToTarget) {
                        this.switchToTargetContext(
                            sourceContext, targetContextId, targetObjectId, useSourceContext
                        );
                    }

                    removed = true;
                }
            }
        }

        return removed;
    }

    public async removeAllContexts(silent: boolean = false): Promise<void> {
        for (const c of [...this.contextInstances]) {
            await this.removeContext(c.instanceId, null, null, false, silent);
        }
        this.switchToTargetContext(null, this.DEFAULT_FALLBACK_CONTEXT);
    }

    public checkDialogConfirmation(contextInstanceId: string, silent?: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const context = this.contextInstances.find((ci) => ci.instanceId === contextInstanceId);
            if (context?.descriptor?.contextType === ContextType.DIALOG) {
                BrowserUtil.openConfirmOverlay(
                    'Translatable#Cancel',
                    'Translatable#Any data you have entered will be lost. Continue?',
                    () => resolve(true),
                    () => resolve(false),
                    ['Translatable#Yes', 'Translatable#No'],
                    false,
                    [
                        PersonalSettingsProperty.DONT_ASK_DIALOG_ON_CLOSE,
                        'Translatable#Always close dialog tab without asking'
                    ],
                    null,
                    silent
                );
            } else {
                resolve(true);
            }
        });
    }

    private canRemove(instanceId: string): boolean {
        let canRemove = true;
        if (this.contextInstances.length === 1) {
            const context = this.getContext(instanceId);
            canRemove = context.contextId !== this.DEFAULT_FALLBACK_CONTEXT;
        }
        return canRemove;
    }

    private switchToTargetContext(
        sourceContext: any, targetContextId?: string, targetObjectId?: string | number, useSourceContext?: boolean
    ): void {
        const context = this.contextInstances.find((c) => c.instanceId === sourceContext?.instanceId);
        if (!useSourceContext && targetContextId) {
            this.setActiveContext(targetContextId, targetObjectId);
        } else if (context) {
            this.setContextByInstanceId(sourceContext.instanceId);
        } else if (this.contextInstances.length > 0) {
            this.setContextByInstanceId(
                this.contextInstances[this.contextInstances.length - 1].instanceId
            );
        } else {
            this.setActiveContext(this.DEFAULT_FALLBACK_CONTEXT);
        }
    }

    public async toggleActiveContext(
        targetContextId?: string, targetObjectId?: string | number, silent?: boolean
    ): Promise<void> {
        await this.removeContext(this.activeContext?.instanceId, targetContextId, targetObjectId, true, silent, true);
    }

    public async setContextByUrl(
        contextUrl: string, objectId?: string | number, urlParams?: URLSearchParams, history: boolean = true
    ): Promise<Context> {
        let context: Context;
        let contextMode = objectId ? ContextMode.DETAILS : ContextMode.DASHBOARD;

        if (urlParams && urlParams.has('search')) {
            contextMode = ContextMode.SEARCH;
        }

        const descriptor = this.contextDescriptorList.find(
            (cd) => cd.urlPaths?.some((p) => p === contextUrl) && cd.contextMode === contextMode
        );
        if (descriptor) {
            context = await this.setActiveContext(descriptor.contextId, objectId, urlParams, [], history);
        }

        return context;
    }

    public async setContextByInstanceId(
        instanceId: string, objectId?: string | number, history: boolean = true
    ): Promise<void> {
        const context = this.contextInstances.find((i) => i.instanceId === instanceId);
        if (context && context.instanceId !== this.activeContext?.instanceId) {

            EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);

            const previousContext = this.getActiveContext();
            if (history) {
                this.setDocumentHistory(true, previousContext, context, objectId);
            }

            this.activeContext = context;
            this.activeContextIndex = this.contextInstances.findIndex((c) => c.instanceId === instanceId);

            EventService.getInstance().publish(ContextEvents.CONTEXT_CHANGED, context);

            if (!this.activeContext.initialized) {
                await this.activeContext.postInit();

                for (const extension of context?.contextExtensions) {
                    await extension?.postInitContext(context);
                }

                this.activeContext.initialized = true;
            }

            await context.update(null);

            EventService.getInstance().publish(RoutingEvent.ROUTE_TO,
                {
                    componentId: context.descriptor.componentId,
                    data: { objectId: context.getObjectId() }
                }
            );

            // TODO: Use Event
            this.serviceListener.forEach(
                (sl) => sl.contextChanged(
                    context.contextId, context, context.descriptor.contextType, null, previousContext
                )
            );
        }
    }

    public async setActiveContext(
        contextId: string, objectId?: string | number, urlParams?: URLSearchParams,
        additionalInformation: Array<[string, any]> = [], history: boolean = true
    ): Promise<Context> {
        const timeout = setTimeout(() => {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Loading ...' }
            );
        }, 150);

        const context = await this.getContextInstance(
            contextId, objectId, additionalInformation, urlParams
        );
        if (context) {
            await this.setContextByInstanceId(context.instanceId, objectId, history);
        }

        if (typeof window !== 'undefined') {
            window.clearTimeout(timeout);
        }
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING,
            { loading: false, hint: '' }
        );

        return context;
    }

    public async setDocumentHistory(
        replaceHistory: boolean, oldContext: Context, context: Context, objectId: string | number
    ): Promise<void> {

        const displayText = await context.getDisplayText();

        if (typeof window !== 'undefined' && window.history) {
            let url = await context.getUrl();
            url = encodeURI(url);
            // extended params should already be encoded
            url = await context.addExtendedUrlParams(url);

            const prefix = KIXModulesService.urlPrefix || '';
            if (prefix) {
                url = `/${prefix}/${url}`;
            } else {
                url = `/${url}`;
            }

            const state = new BrowserHistoryState(context.contextId, objectId);
            if (oldContext) {
                window.history.pushState(state, displayText, url);
                ContextHistory.getInstance().addHistoryEntry(oldContext);
            } else if (replaceHistory) {
                window.history.replaceState(state, displayText, url);
            }
        }

        if (typeof document !== 'undefined') {
            const documentTitle = displayText;
            document.title = documentTitle;
        }
    }

    public getHistory(limit: number = 10): ContextHistoryEntry[] {
        return ContextHistory.getInstance().getHistory(limit, this.activeContext)
            .filter(
                (he) => he.contextId !== this.activeContext.contextId
                    || he.objectId !== this.activeContext.getObjectId()
            )
            .sort((a, b) => b.lastVisitDate - a.lastVisitDate)
            .slice(0, limit);
    }

    public addExtendedContext(contextId: string, extension: new () => ContextExtension): void {
        if (!this.contextExtensions.has(contextId)) {
            this.contextExtensions.set(contextId, []);
        }
        this.contextExtensions.get(contextId).push(extension);
    }

    public getContextExtensions(contextId: string): Array<new () => ContextExtension> {
        if (this.contextExtensions.has(contextId)) {
            return this.contextExtensions.get(contextId);
        }
        return [];
    }

    public async getURI(
        contextId: string, objectId: string | number, parameter: Array<[string, any]>
    ): Promise<string> {
        let url = '';
        const descriptor = this.contextDescriptorList.find((d) => d.contextId === contextId);
        if (descriptor) {
            objectId = objectId ? `/${objectId}` : '';
            url = descriptor.urlPaths[0] + objectId;
            const urlParams = await BrowserUtil.prepareUrlParameter(parameter);

            if (urlParams.length) {
                url = `${url}?${urlParams.join('&')}`;
            }
        }

        return url;
    }

    private async createContextInstance(
        contextId: string, objectId?: string | number, instanceId?: string, urlParams?: URLSearchParams,
        additionalInformation: Array<[string, any]> = [],
        contextPreference?: ContextPreference
    ): Promise<Context> {
        objectId = objectId?.toString();
        const promiseKey = JSON.stringify({ contextId, objectId });

        if (!this.contextCreatePromises.has(promiseKey)) {
            this.contextCreatePromises.set(
                promiseKey, this.createPromise(
                    promiseKey, contextId, objectId, instanceId,
                    urlParams, additionalInformation, contextPreference
                )
            );
        }

        return this.contextCreatePromises.get(promiseKey);
    }

    private createPromise(
        promiseKey: string, contextId: string, objectId?: string | number, instanceId?: string,
        urlParams?: URLSearchParams,
        additionalInformation: Array<[string, any]> = [],
        contextPreference?: ContextPreference
    ): Promise<Context> {
        return new Promise<Context>(async (resolve, reject) => {
            const descriptor = this.contextDescriptorList.find((cd) => cd.contextId === contextId);

            let context: Context;
            if (descriptor) {
                const allowed = await AuthenticationSocketClient.getInstance().checkPermissions(descriptor.permissions);

                if (allowed) {
                    const configuration = await ContextSocketClient.getInstance().loadContextConfiguration(
                        descriptor.contextId
                    ).catch(
                        (error) => { reject(error); }
                    );

                    if (configuration) {
                        context = new descriptor.contextClass(descriptor, objectId, configuration, instanceId);

                        const previousContext = this.getActiveContext();
                        if (previousContext) {
                            context.setAdditionalInformation(AdditionalContextInformation.SOURCE_CONTEXT, {
                                contextId: previousContext.contextId,
                                objectId: previousContext.getObjectId(),
                                instanceId: previousContext.instanceId
                            });
                        }
                        if (additionalInformation) {
                            additionalInformation.forEach((ai) => context.setAdditionalInformation(ai[0], ai[1]));
                        }
                        if (contextPreference) {
                            await context.getStorageManager()?.loadStoredValues(contextPreference);
                        }

                        await context.initContext(urlParams).catch((e) => {
                            console.error(e);
                            this.removeContext(instanceId);
                        });


                        const index = this.activeContextIndex >= 0
                            ? this.activeContextIndex
                            : this.contextInstances.length - 1;
                        this.contextInstances.splice(index + 1, 0, context);
                        EventService.getInstance().publish(ContextEvents.CONTEXT_CREATED, context);
                    }
                }
            }
            this.contextCreatePromises.delete(promiseKey);
            resolve(context);
        });
    }

    public hasContextDescriptor(contextId: string): boolean {
        return this.contextDescriptorList.some((d) => d.contextId === contextId);
    }

    public notifyUpdates(updates: Array<[KIXObjectType | string, string | number]>): void {
        for (const context of this.contextInstances) {
            const detailsUpdate = context.descriptor.contextMode === ContextMode.DETAILS;
            const objectType = context.descriptor.kixObjectTypes[0];
            const objectId = context.getObjectId()?.toString();

            let publishEvent = false;

            if (detailsUpdate) {
                publishEvent = updates.some((u) => u[0] === objectType && u[1].toString() === objectId);
            } else {
                publishEvent = updates.some((u) => u[0] === objectType);
            }

            if (publishEvent) {
                EventService.getInstance().publish(
                    ContextEvents.CONTEXT_UPDATE_REQUIRED,
                    context
                );
            }
        }
    }

    public async isContextStored(instanceId: string): Promise<boolean> {
        let isStored = false;
        const contextList = await this.getStoredContextList() || [];

        isStored = contextList
            .filter((c) => c !== null && typeof c !== 'undefined')
            .some((c) => c.instanceId === instanceId);

        return isStored;
    }

    public async getStoredContextList(): Promise<ContextPreference[]> {
        if (!this.storedContexts) {
            this.storedContexts = await ContextSocketClient.getInstance().loadStoredContexts().catch(() => []);
        }

        return [...this.storedContexts];
    }

    public async updateStorage(instanceId: string, remove?: boolean): Promise<boolean> {
        const execute = this.storageProcessQueue.length === 0;
        const promise = this.createStoragePromise(instanceId, remove);
        if (promise) {
            if (execute) {
                return promise;
            } else {
                this.storageProcessQueue.push(promise);
            }
        }
    }

    private createStoragePromise(instanceId: string, remove?: boolean): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const context = this.getContext(instanceId);
            if (!context) {
                resolve(false);
                return;
            }

            if (context.descriptor?.contextType === ContextType.DIALOG && !this.isStorableDialogContext(context)) {
                resolve(false);
                return;
            }

            const index = this.storedContexts.findIndex((c) => c?.instanceId === context.instanceId);
            if (index !== -1) {
                this.storedContexts.splice(index, 1);
            }

            let stored = false;
            if (remove) {
                ContextSocketClient.getInstance().removeStoredContext(context.instanceId);
            } else {
                const preference = await context?.getStorageManager()?.getStorableContextPreference()
                    .catch((error) => {
                        console.error('Could not store context');
                        console.error(error);
                        return null;
                    });

                if (preference) {
                    this.storedContexts.push(preference);
                    stored = true;
                }
                ContextSocketClient.getInstance().storeContext(preference);
            }

            if (stored) {
                EventService.getInstance().publish(ContextEvents.CONTEXT_STORED, context);
            }

            if (this.storageProcessQueue.length) {
                const promise = this.storageProcessQueue.splice(0, 1);
                await promise[0];
            }

            resolve(true);
        });
    }

    public async reorderContext(instanceIdToMove: string, targetInstanceId: string): Promise<void> {
        const sourceIndex = this.contextInstances.findIndex((i) => i.instanceId === instanceIdToMove);
        const targetIndex = this.contextInstances.findIndex((i) => i.instanceId === targetInstanceId);

        if (sourceIndex !== -1 && targetIndex !== -1) {
            const contextToMove = this.contextInstances.splice(sourceIndex, 1);
            this.contextInstances.splice(targetIndex, 0, contextToMove[0]);

            EventService.getInstance().publish(ContextEvents.CONTEXT_REORDERED);

            const sourceIsStored = await this.isContextStored(instanceIdToMove);

            if (sourceIsStored) {
                this.storedContexts.sort((a, b) => {
                    const indexA = this.contextInstances.findIndex((i) => i.instanceId === a.instanceId);
                    const indexB = this.contextInstances.findIndex((i) => i.instanceId === b.instanceId);
                    return indexA - indexB;
                });

                await AgentService.getInstance().setPreferences(
                    [['AgentPortalContextList', this.storedContexts.map((p) => JSON.stringify(p))]]
                );
            }
        }
    }

    // TODO: OBSOLOTE: Do not use listener concept. Use EventService
    public registerListener(listener: IContextServiceListener): void {
        this.serviceListener.set(listener.constexServiceListenerId, listener);
    }

    public unregisterListener(listenerId: string): void {
        this.serviceListener.delete(listenerId);
    }

    public async saveUserWidgetList(
        instanceIds: string[], modifiedWidgets: ConfiguredWidget[], contextWidgetList: string
    ): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const contextId = context.descriptor.contextId;

            TableFactoryService.getInstance().deleteContextTables(context?.contextId);

            const currentUser = await AgentService.getInstance().getCurrentUser();
            const preference = currentUser.Preferences.find((p) => p.ID === 'ContextWidgetLists');
            const preferenceValue = preference && preference.Value ? JSON.parse(preference.Value) : {};
            const userWidgetList: Array<string | ConfiguredWidget> = preferenceValue[contextId]
                ? preferenceValue[contextId][contextWidgetList] || []
                : [];

            const newWidgetList = [];
            for (const instanceId of instanceIds) {
                const modifiedWidget = modifiedWidgets.find((w) => w.instanceId === instanceId);
                if (modifiedWidget) {
                    newWidgetList.push(modifiedWidget);
                } else {
                    const widget = userWidgetList.find((w) => typeof w !== 'string' && w.instanceId === instanceId);
                    if (widget) {
                        newWidgetList.push(widget);
                    } else {
                        newWidgetList.push(instanceId);
                    }
                }
            }

            if (!preferenceValue[contextId]) {
                preferenceValue[contextId] = {};
            }

            preferenceValue[contextId][contextWidgetList] = newWidgetList;

            const preferences: Array<[string, string]> = [
                ['ContextWidgetLists', JSON.stringify(preferenceValue)]
            ];
            await AgentService.getInstance().setPreferences(preferences);
        }
    }

    public async reloadContextConfigurations(): Promise<void> {
        for (const context of this.contextInstances) {
            const configuration = await ContextSocketClient.getInstance().loadContextConfiguration(
                context.descriptor.contextId
            ).catch((error): ContextConfiguration => {
                console.error(error);
                return null;
            });

            if (configuration) {
                context.setConfiguration(configuration);
            }
        }
    }

    public registerToolbarActions(actions: ToolbarAction[]): void {
        actions.forEach((a) => {
            this.toolbarActions.set(a.title, a);
        });
    }

    public getToolbarAction(key: string): ToolbarAction {
        return this.toolbarActions.get(key);
    }

}
