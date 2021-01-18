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
import { ContextFactory } from './ContextFactory';
import { DialogService } from './DialogService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { BrowserHistoryState } from './BrowserHistoryState';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { RoutingService } from './RoutingService';
import { ContextHistory } from './ContextHistory';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { AdditionalContextInformation } from './AdditionalContextInformation';
import { FormService } from './FormService';
import { TableFactoryService } from './table/TableFactoryService';
import { ContextHistoryEntry } from './ContextHistoryEntry';
import { ContextConfiguration } from '../../../../model/configuration/ContextConfiguration';
import { ContextSocketClient } from './ContextSocketClient';
import { Context } from '../../../../model/Context';
import { ContextExtension } from '../../../../model/ContextExtension';

export class ContextService {

    private static INSTANCE: ContextService = null;

    public static getInstance(): ContextService {
        if (!ContextService.INSTANCE) {
            ContextService.INSTANCE = new ContextService();
        }

        return ContextService.INSTANCE;
    }

    private serviceListener: Map<string, IContextServiceListener> = new Map();
    private activeMainContext: Context;
    private activeDialogContext: Context;
    private activeContextType: ContextType = ContextType.MAIN;

    private contextExtensions: Map<string, ContextExtension[]> = new Map();

    public async resetAll(): Promise<void> {
        await ContextFactory.getInstance().clearContextInstances(this.activeMainContext);
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

    public registerListener(listener: IContextServiceListener): void {
        this.serviceListener.set(listener.constexServiceListenerId, listener);
    }

    public unregisterListener(listenerId: string): void {
        this.serviceListener.delete(listenerId);
    }

    public registerContext(contextDescriptor: ContextDescriptor): void {
        ContextFactory.getInstance().registerContext(contextDescriptor);
        this.serviceListener.forEach((l) => l.contextRegistered(contextDescriptor));
    }

    public async setContext(
        contextId: string, kixObjectType: KIXObjectType | string, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, history: boolean = false,
        addHistory: boolean = true, replaceHistory: boolean = false, urlParams?: URLSearchParams
    ): Promise<void> {

        const oldContext = this.getActiveContext();

        const context = await ContextFactory.getInstance().getContext(
            contextId, kixObjectType, contextMode, objectId, (!history && reset), oldContext
        );

        if (context && context.getDescriptor().contextType === ContextType.MAIN) {

            if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                context.setObjectId(objectId, kixObjectType);
            }

            await context.initContext(urlParams);

            this.setDocumentHistory(addHistory, replaceHistory, oldContext, context, objectId);

            DialogService.getInstance().closeMainDialog();
            this.activeMainContext = context;

            RoutingService.getInstance().routeTo(
                'base-router', context.getDescriptor().componentId, { objectId: context.getObjectId(), history }
            );

            this.serviceListener.forEach(
                (sl) => sl.contextChanged(
                    context.getDescriptor().contextId, context, context.getDescriptor().contextType, history, oldContext
                )
            );
        }
    }

    public async setDocumentHistory(
        addHistory: boolean, replaceHistory: boolean, oldContext: Context, context: Context, objectId: string | number
    ): Promise<void> {

        const displayText = await context.getDisplayText();

        if (window && window.history) {
            let url = await context.getUrl();
            url = encodeURI(url);
            const state = new BrowserHistoryState(context.getDescriptor().contextId, objectId);
            if (addHistory && oldContext) {
                window.history.pushState(state, displayText, '/' + url);
                ContextHistory.getInstance().addHistoryEntry(oldContext);
            } else if (replaceHistory) {
                window.history.replaceState(state, displayText, '/' + url);
            }
        }

        if (document) {
            const documentTitle = displayText;
            document.title = documentTitle;
        }
    }

    public async setDialogContext(
        contextId: string, objectType?: KIXObjectType | string, contextMode?: ContextMode, objectId?: string | number,
        resetContext?: boolean, title?: string, singleTab?: boolean, icon?: string | ObjectIcon,
        formId?: string, deleteForm: boolean = true, additionalInformation: Array<[string, any]> = []
    ): Promise<Context> {
        const oldContext = this.getActiveContext();

        let context: Context = await ContextFactory.getInstance().getContext(
            contextId, objectType, contextMode, objectId, resetContext
        );

        if (!context) {
            const dialogs = await DialogService.getInstance().getRegisteredDialogs(contextMode);
            if (dialogs && dialogs.length) {
                context = await ContextFactory.getInstance().getContext(
                    contextId, dialogs[0].kixObjectType, dialogs[0].contextMode, null, resetContext
                );
            }
        }

        if (context) {
            additionalInformation.forEach((ai) => context.setAdditionalInformation(ai[0], ai[1]));
        }

        if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
            this.handleDialogContext(
                context, oldContext, formId, objectType, deleteForm, title, icon, singleTab, objectId
            );
        }

        return context;
    }

    private async handleDialogContext(
        context: Context, oldContext: Context, formId: string, objectType: KIXObjectType | string,
        deleteForm: boolean, title: string, icon: ObjectIcon | string, singleTab: boolean, objectId?: string | number
    ): Promise<void> {
        this.activeDialogContext = context;
        this.activeContextType = ContextType.DIALOG;

        if (!formId) {
            formId = await context.getFormId(context.getDescriptor().contextMode, objectType, context.getObjectId());
        }

        if (objectId) {
            await context.setObjectId(objectId, objectType);
        } else if (context.getObjectId()) {
            await context.setObjectId(context.getObjectId(), objectType);
        }

        if (formId) {
            context.setAdditionalInformation(AdditionalContextInformation.FORM_ID, formId);
            if (deleteForm) {
                FormService.getInstance().deleteFormInstance(formId);
            }
            await FormService.getInstance().getFormInstance(formId);
        }

        await context.initContext();

        DialogService.getInstance().openMainDialog(
            context.getDescriptor().contextMode, context.getDescriptor().componentId,
            objectType, title, icon, singleTab
        );

        this.serviceListener.forEach(
            (sl) => sl.contextChanged(
                context.getDescriptor().contextId, context, context.getDescriptor().contextType, false, oldContext
            )
        );
    }

    public closeDialogContext(): void {
        if (this.activeDialogContext) {
            TableFactoryService.getInstance().deleteDialogTables(this.activeDialogContext.getDescriptor().contextId);
        }
        this.activeContextType = ContextType.MAIN;
        this.activeDialogContext = null;
        ContextFactory.getInstance().resetDialogContexts();
    }

    public getActiveContext<T extends Context = Context>(contextType?: ContextType): T {
        const type = contextType ? contextType : this.activeContextType;
        return type === ContextType.MAIN
            ? this.activeMainContext as any
            : this.activeDialogContext;
    }

    public async getContext<T extends Context = Context>(contextId: string, objectId?: string | number): Promise<T> {
        return (await ContextFactory.getInstance().getContext(contextId, null, null, objectId) as T);
    }

    public async getContextByTypeAndMode<T extends Context = Context>(
        objectType: KIXObjectType | string, contextMode: ContextMode | ContextMode[] = ContextMode.DETAILS
    ): Promise<T> {
        if (!Array.isArray(contextMode)) {
            contextMode = [contextMode];
        }
        let context;
        for (const mode of contextMode) {
            context = await ContextFactory.getInstance().getContext(null, objectType, mode);
            if (context) {
                break;
            }
        }
        return context as T;
    }

    public getHistory(limit: number = 10): ContextHistoryEntry[] {
        return ContextHistory.getInstance().getHistory(limit, this.activeMainContext)
            .filter(
                (he) => he.contextId !== this.activeMainContext.getDescriptor().contextId
                    || he.objectId !== this.activeMainContext.getObjectId()
            )
            .sort((a, b) => b.lastVisitDate - a.lastVisitDate)
            .slice(0, limit);
    }

    public async getContextConfiguration(contextId: string): Promise<ContextConfiguration> {
        const configuration = await ContextSocketClient.getInstance().loadContextConfiguration(contextId);
        return configuration;
    }

    public updateObjectLists(objectType: KIXObjectType | string): void {
        const contexts = ContextFactory.getInstance().getContextInstances(ContextType.MAIN, ContextMode.DASHBOARD);
        contexts.forEach((c) => c.reloadObjectList(objectType));
    }

}
