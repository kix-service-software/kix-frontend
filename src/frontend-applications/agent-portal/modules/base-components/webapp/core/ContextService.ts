/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IContextServiceListener } from "./IContextServiceListener";
import { ContextType } from "../../../../model/ContextType";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextFactory } from "./ContextFactory";
import { DialogService } from "./DialogService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../model/ContextMode";
import { BrowserHistoryState } from "./BrowserHistoryState";
import { RoutingConfiguration } from "../../../../model/configuration/RoutingConfiguration";
import { RoutingService } from "./RoutingService";
import { ContextHistory } from "./ContextHistory";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { AdditionalContextInformation } from "./AdditionalContextInformation";
import { FormService } from "./FormService";
import { TableFactoryService } from "./table";
import { ContextHistoryEntry } from "./ContextHistoryEntry";
import { ContextConfiguration } from "../../../../model/configuration/ContextConfiguration";
import { ContextSocketClient } from "./ContextSocketClient";
import { Context } from "../../../../model/Context";


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

    public registerListener(listener: IContextServiceListener): void {
        this.serviceListener.set(listener.constexServiceListenerId, listener);
    }

    public unregisterListener(listenerId: string): void {
        this.serviceListener.delete(listenerId);
    }

    public async registerContext(contextDescriptor: ContextDescriptor): Promise<void> {
        ContextFactory.getInstance().registerContext(contextDescriptor);
        this.serviceListener.forEach((l) => l.contextRegistered(contextDescriptor));
    }

    public async setContext(
        contextId: string, kixObjectType: KIXObjectType | string, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, history: boolean = false,
        addHistory: boolean = true, replaceHistory: boolean = false
    ): Promise<void> {

        const oldContext = this.getActiveContext();

        const context = await ContextFactory.getInstance().getContext(
            contextId, kixObjectType, contextMode, objectId, (!history && reset), oldContext
        );

        if (context && context.getDescriptor().contextType === ContextType.MAIN) {
            if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                await context.setObjectId(objectId);
            }

            const state = new BrowserHistoryState(contextId, objectId);
            const displayText = await context.getDisplayText();

            const routingConfiguration = new RoutingConfiguration(
                contextId, null, null, null
            );
            const url = await RoutingService.getInstance().buildUrl(routingConfiguration, objectId);

            if (addHistory && oldContext && window && window.history) {
                window.history.pushState(state, displayText, '/' + url);
                await ContextHistory.getInstance().addHistoryEntry(oldContext);
            } else if (replaceHistory) {
                window.history.replaceState(state, displayText, '/' + url);
            }
            DialogService.getInstance().closeMainDialog();
            this.activeMainContext = context;

            if (document) {
                const documentTitle = await context.getDisplayText();
                document.title = documentTitle;
            }

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

    public async setDialogContext(
        contextId: string, objectType?: KIXObjectType | string, contextMode?: ContextMode, objectId?: string | number,
        resetContext?: boolean, title?: string, singleTab?: boolean, icon?: string | ObjectIcon,
        formId?: string, deleteForm: boolean = true
    ): Promise<void> {
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

        if (context && context.getDescriptor().contextType === ContextType.DIALOG) {

            this.activeDialogContext = context;
            this.activeContextType = ContextType.DIALOG;

            if (!formId) {
                formId = await context.getFormId(contextMode, objectType, objectId);
            }

            if (objectId) {
                await context.setObjectId(objectId);
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
    }

    public closeDialogContext(): void {
        if (this.activeDialogContext) {
            TableFactoryService.getInstance().deleteDialogTables(this.activeDialogContext.getDescriptor().contextId);
        }
        this.activeContextType = ContextType.MAIN;
        this.activeDialogContext = null;
        ContextFactory.getInstance().resetDialogContexts();
    }

    public getActiveContext(contextType?: ContextType): Context {
        const type = contextType ? contextType : this.activeContextType;
        return type === ContextType.MAIN ? this.activeMainContext : this.activeDialogContext;
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

}
