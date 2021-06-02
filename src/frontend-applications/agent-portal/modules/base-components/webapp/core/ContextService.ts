/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class ContextService {

    private static INSTANCE: ContextService = null;

    public static getInstance(): ContextService {
        if (!ContextService.INSTANCE) {
            ContextService.INSTANCE = new ContextService();
        }

        return ContextService.INSTANCE;
    }

    private contextDescriptorList: ContextDescriptor[] = [];
    private contextInstances: Context[] = [];
    private contextCreatePromises: Map<string, Promise<Context>> = new Map();

    private serviceListener: Map<string, IContextServiceListener> = new Map();
    private activeContext: Context;
    private contextExtensions: Map<string, ContextExtension[]> = new Map();

    private storedContexts: ContextPreference[];
    private storageProcessQueue: Array<Promise<void>> = [];

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
        const context = await this.createContext(
            contextPreference.contextDescriptor.contextId, contextPreference.objectId, contextPreference.instanceId
        );

        if (context) {
            await context.getStorageManager()?.loadStoredValues(contextPreference);
        }
    }

    public getContextDescriptors(contextMode: ContextMode): ContextDescriptor[] {
        return this.contextDescriptorList.filter((cd) => cd.contextMode === contextMode);
    }

    public getContextDescriptor(contextId: string): ContextDescriptor {
        return this.contextDescriptorList.find((d) => d.contextId === contextId);
    }

    public getContext(instanceId: string): Context {
        return this.contextInstances.find((i) => i.instanceId === instanceId);
    }

    private async getContextInstance(
        contextId: string, objectId?: string | number, createNewInstance: boolean = true,
        additionalInformation: Array<[string, any]> = []
    ): Promise<Context> {
        let context = this.contextInstances.find((c) => c.equals(contextId, objectId));

        const createModes = [
            ContextMode.CREATE, ContextMode.CREATE_ADMIN, ContextMode.CREATE_LINK, ContextMode.CREATE_SUB
        ];

        const isNewDialog = context?.descriptor?.contextType === ContextType.DIALOG
            && createModes.some((cm) => cm === context?.descriptor?.contextMode);

        if ((!context || isNewDialog) && createNewInstance) {
            context = await this.createContextInstance(contextId, objectId);

            additionalInformation.forEach((ai) => context.setAdditionalInformation(ai[0], ai[1]));

            if (context?.descriptor?.contextType === ContextType.DIALOG) {
                await this.updateStorage(context?.instanceId);
            }
        }
        return context;
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

    public async createContext(contextId: string, objectId: string | number, instanceId?: string): Promise<Context> {
        let context = this.contextInstances.find(
            (c) => c.instanceId === instanceId || c.equals(contextId, objectId)
        );
        if (!context) {
            context = await this.createContextInstance(contextId, objectId, instanceId);
        }

        return context;
    }

    public async removeContext(
        instanceId: string, targetContextId?: string, targetObjectId?: string | number
    ): Promise<boolean> {
        let removed = false;

        if (this.canRemove(instanceId)) {
            await this.switchToTargetContext(instanceId, targetContextId, targetObjectId);

            const index = this.contextInstances.findIndex((c) => c.instanceId === instanceId);
            if (index !== -1) {
                const isStored = await this.isContextStored(instanceId);
                if (isStored) {
                    await this.updateStorage(instanceId, true);
                }
                const context = this.contextInstances.splice(index, 1);
                await context[0].destroy();
                EventService.getInstance().publish(ContextEvents.CONTEXT_REMOVED, context[0]);
            }
            removed = true;
        }

        return removed;
    }

    private canRemove(instanceId: string): boolean {
        let canRemove = true;
        if (this.contextInstances.length === 1) {
            const context = this.getContext(instanceId);
            canRemove = context.contextId !== 'home';
        }
        return canRemove;
    }

    private async switchToTargetContext(
        instanceId: string, targetContextId?: string, targetObjectId?: string | number
    ): Promise<void> {
        if (this.activeContext?.instanceId === instanceId) {
            if (targetContextId) {
                await this.setActiveContext(targetContextId, targetObjectId);
            } else {
                const sourceContext = this.activeContext.getAdditionalInformation('SourceContext');
                const context = await this.getContextInstance(sourceContext?.instanceId, null, false);
                if (context) {
                    await this.setContextByInstanceId(sourceContext.instanceId);
                } else if (this.contextInstances.length - 1 > 0) {
                    await this.setContextByInstanceId(
                        this.contextInstances[this.contextInstances.length - 2].instanceId
                    );
                } else {
                    await this.setActiveContext('home');
                }
            }
        }
    }

    public async toggleActiveContext(
        targetContextId?: string, targetObjectId?: string | number
    ): Promise<void> {
        await this.removeContext(this.activeContext?.instanceId, targetContextId, targetObjectId);
    }

    public async setContextByUrl(contextUrl: string, objectId?: string | number): Promise<void> {
        const contextMode = objectId ? ContextMode.DETAILS : ContextMode.DASHBOARD;
        const descriptor = this.contextDescriptorList.find(
            (cd) => cd.urlPaths.some((p) => p === contextUrl) && cd.contextMode === contextMode
        );
        if (descriptor) {
            await this.setActiveContext(descriptor.contextId, objectId);
        }
    }

    public async setContextByInstanceId(
        instanceId: string, objectId?: string | number, urlParams?: URLSearchParams
    ): Promise<void> {
        const context = this.contextInstances.find((i) => i.instanceId === instanceId);
        if (context && context.instanceId !== this.activeContext?.instanceId) {
            let error: boolean = false;

            await context.initContext(urlParams).catch((e) => {
                console.error(e);
                this.removeContext(instanceId);
                error = true;
            });

            if (!error) {
                const previousContext = this.getActiveContext();
                this.setDocumentHistory(true, previousContext, context, objectId);
                this.activeContext = context;

                EventService.getInstance().publish(RoutingEvent.ROUTE_TO,
                    {
                        componentId: context.descriptor.componentId,
                        data: { objectId: context.getObjectId() }
                    }
                );

                EventService.getInstance().publish(ContextEvents.CONTEXT_CHANGED, context);

                // TODO: Use Event
                this.serviceListener.forEach(
                    (sl) => sl.contextChanged(
                        context.contextId, context, context.descriptor.contextType, null, previousContext
                    )
                );
            }
        }
    }

    public async setActiveContext(
        contextId: string, objectId?: string | number, urlParams?: URLSearchParams,
        additionalInformation: Array<[string, any]> = []
    ): Promise<Context> {
        const context = await this.getContextInstance(contextId, objectId, true, additionalInformation);
        if (context) {
            await this.setContextByInstanceId(context.instanceId, objectId, urlParams);
        }
        return context;
    }

    public async setDocumentHistory(
        replaceHistory: boolean, oldContext: Context, context: Context, objectId: string | number
    ): Promise<void> {

        const displayText = await context.getDisplayText();

        if (typeof window !== 'undefined' && window.history) {
            let url = await context.getUrl();
            url = encodeURI(url);
            const state = new BrowserHistoryState(context.contextId, objectId);
            if (oldContext) {
                window.history.pushState(state, displayText, '/' + url);
                ContextHistory.getInstance().addHistoryEntry(oldContext);
            } else if (replaceHistory) {
                window.history.replaceState(state, displayText, '/' + url);
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

    public addExtendedContext(contextId: string, extension: ContextExtension): void {
        if (!this.contextExtensions.has(contextId)) {
            this.contextExtensions.set(contextId, []);
        }
        this.contextExtensions.get(contextId).push(extension);
    }

    public getContextExtensions(contextId: string): ContextExtension[] {
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
        contextId: string, objectId?: string | number, instanceId?: string
    ): Promise<Context> {
        objectId = objectId?.toString();
        const promiseKey = JSON.stringify({ contextId, objectId });
        if (!this.contextCreatePromises.has(promiseKey)) {
            this.contextCreatePromises.set(
                promiseKey, this.createPromise(contextId, objectId, instanceId)
            );
        }

        const contextPromise = this.contextCreatePromises.get(promiseKey);
        const newContext = await contextPromise.catch((): Context => null);

        if (newContext) {
            const index = this.activeContext
                ? this.contextInstances.findIndex((c) => c.instanceId === this.activeContext.instanceId)
                : this.contextInstances.length - 1;
            this.contextInstances.splice(index + 1, 0, newContext);

            EventService.getInstance().publish(ContextEvents.CONTEXT_CREATED, newContext);
        }

        this.contextCreatePromises.delete(promiseKey);
        return newContext;
    }

    private createPromise(
        contextId: string, objectId?: string | number, instanceId?: string
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
                            context.setAdditionalInformation('SourceContext', {
                                contextId: previousContext.contextId,
                                objectId: previousContext.getObjectId(),
                                instanceId: previousContext.instanceId
                            });
                        }
                    }
                }
            }

            resolve(context);
        });
    }

    public hasContextDescriptor(contextId: string): boolean {
        return this.contextDescriptorList.some((d) => d.contextId === contextId);
    }

    public notifyUpdates(updates: Array<[KIXObjectType | string, string | number]>): void {
        updates.forEach((objectUpdate) => {
            this.contextInstances.forEach((context) => {
                if (context.descriptor.kixObjectTypes.some((ot) => ot === objectUpdate[0])) {
                    let publishEvent = true;
                    if (
                        context.descriptor.contextMode === ContextMode.DETAILS &&
                        context.getObjectId()?.toString() !== objectUpdate[1]?.toString()
                    ) {
                        publishEvent = false;
                    }

                    if (publishEvent) {
                        EventService.getInstance().publish(
                            ContextEvents.CONTEXT_UPDATE_REQUIRED,
                            context
                        );
                    }
                }
            });
        });
    }

    public async isContextStored(instanceId: string): Promise<boolean> {
        let isStored = false;
        const contextList = await this.getStoredContextList();
        isStored = Array.isArray(contextList) ? contextList.some((c) => c.instanceId === instanceId) : false;

        return isStored;
    }

    public async getStoredContextList(): Promise<ContextPreference[]> {
        if (!this.storedContexts) {
            let contextList: ContextPreference[] = [];
            const preference = await AgentService.getInstance().getUserPreference('AgentPortalContextList');
            if (preference) {
                try {
                    contextList = JSON.parse(preference.Value);
                } catch (error) {
                    console.error('Could not load COntextList from Preferences.');
                    console.error(error);
                }
            }

            this.storedContexts = Array.isArray(contextList) ? contextList : [];
        }

        return [...this.storedContexts];
    }

    public async updateStorage(instanceId: string, remove?: boolean): Promise<void> {
        const execute = this.storageProcessQueue.length === 0;
        const promise = this.createStoragePromise(instanceId, remove);
        if (promise) {
            if (execute) {
                await promise;
            } else {
                this.storageProcessQueue.push(promise);
            }
        }
    }

    private createStoragePromise(instanceId: string, remove?: boolean): Promise<void> {
        const context = this.getContext(instanceId);
        if (!context) {
            return null;
        }

        return new Promise<void>(async (resolve, reject) => {
            const index = this.storedContexts.findIndex((c) => c.instanceId === context.instanceId);
            if (index !== -1) {
                this.storedContexts.splice(index, 1);
            }

            let stored = false;
            if (!remove) {
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
            }

            await AgentService.getInstance().setPreferences(
                [['AgentPortalContextList', JSON.stringify(this.storedContexts)]]
            );

            if (stored) {
                EventService.getInstance().publish(ContextEvents.CONTEXT_STORED, context);
            }

            if (this.storageProcessQueue.length) {
                const promise = this.storageProcessQueue.splice(0, 1);
                await promise[0];
            }

            resolve();
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
                    [['AgentPortalContextList', JSON.stringify(this.storedContexts)]]
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

    public async saveUserWidgetList(widgets: ConfiguredWidget[], contextWidgetList: string): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            const contextWidgets: ConfiguredWidget[] = context.getConfiguration()[contextWidgetList];

            const preferences: Array<[string, string]> = [];

            const widgetList: Array<ConfiguredWidget | string> = [];
            for (const widget of widgets) {
                if (contextWidgets?.some((w) => w.instanceId === widget.instanceId)) {
                    widgetList.push(widget.instanceId);
                } else {
                    widgetList.push(widget);
                }
            }

            const contextId = context.descriptor.contextId;

            const currentUser = await AgentService.getInstance().getCurrentUser();
            const preference = currentUser.Preferences.find((p) => p.ID === 'ContextWidgetLists');
            const preferenceValue = preference ? JSON.parse(preference.Value) : {};

            if (!preferenceValue[contextId]) {
                preferenceValue[contextId] = {};
            }

            preferenceValue[contextId][contextWidgetList] = widgetList;

            preferences.push(['ContextWidgetLists', JSON.stringify(preferenceValue)]);
            await AgentService.getInstance().setPreferences(preferences);
        }
    }

}
