/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainDialogListener } from "./IMainDialogListener";
import { IOverlayDialogListener } from "./IOverlayDialogListener";
import { IImageDialogListener } from "./IImageDialogListener";
import { ConfiguredDialogWidget } from "../../../../model/configuration/ConfiguredDialogWidget";
import { ContextService } from "./ContextService";
import { ContextMode } from "../../../../model/ContextMode";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ObjectIcon } from "../../../icon/model/ObjectIcon";
import { ContextType } from "../../../../model/ContextType";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { BrowserCacheService } from "./CacheService";
import { DisplayImageDescription } from "./DisplayImageDescription";
import { ContextFactory } from "./ContextFactory";
import { EventService } from "./EventService";
import { ApplicationEvent } from "./ApplicationEvent";

export class DialogService {

    private static INSTANCE: DialogService = null;

    private mainDialogListener: IMainDialogListener;
    private resultListeners: Map<string, Array<[string, (result: any) => void]>> = new Map();

    private overlayDialogListener: IOverlayDialogListener;

    private imageDialogListener: IImageDialogListener;

    public activeDialog: ConfiguredDialogWidget = null;

    private constructor() { }

    public static getInstance(): DialogService {
        if (!DialogService.INSTANCE) {
            DialogService.INSTANCE = new DialogService();
        }

        return DialogService.INSTANCE;
    }

    public registerMainDialogListener(listener: IMainDialogListener): void {
        this.mainDialogListener = listener;
    }

    public registerOverlayDialogListener(listener: IOverlayDialogListener): void {
        this.overlayDialogListener = listener;
    }

    public registerImageDialogListener(listener: IImageDialogListener): void {
        this.imageDialogListener = listener;
    }

    public async openMainDialog(
        contextMode: ContextMode = ContextMode.CREATE,
        dialogId?: string,
        kixObjectType?: KIXObjectType | string,
        title?: string,
        dialogIcon?: string | ObjectIcon,
        singleTab: boolean = false
    ): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        const contextIcon = context ? context.getIcon() : null;
        const contextTitle = context ? await context.getDisplayText(true) : '';

        let dialogTitle = title;
        if (this.mainDialogListener) {
            const objectTitle = await TranslationService.translate('Translatable#New Object', []);
            switch (contextMode) {
                case ContextMode.CREATE:
                    dialogTitle = dialogTitle || objectTitle;
                    dialogIcon = dialogIcon || 'kix-icon-plus-blank';
                    break;
                case ContextMode.CREATE_SUB:
                    dialogTitle = contextTitle || dialogTitle || objectTitle;
                    dialogIcon = contextIcon || dialogIcon || 'kix-icon-unknown';
                    break;
                case ContextMode.CREATE_ADMIN:
                    dialogTitle = dialogTitle || await TranslationService.translate('Translatable#Add Object');
                    dialogIcon = dialogIcon || 'kix-icon-plus-blank';
                    singleTab = true;
                    break;
                case ContextMode.SEARCH:
                    dialogTitle = dialogTitle || await TranslationService.translate('Translatable#Advanced Search', []);
                    dialogIcon = dialogIcon || 'kix-icon-search';
                    break;
                case ContextMode.EDIT:
                    dialogTitle = contextTitle || await TranslationService.translate('Translatable#Edit Object');
                    dialogIcon = dialogIcon || contextIcon;
                    singleTab = true;
                    break;
                case ContextMode.EDIT_BULK:
                    dialogTitle = await TranslationService.translate('Translatable#Bulk Action');
                    dialogIcon = dialogIcon || 'kix-icon-arrow-collect';
                    singleTab = true;
                    break;
                case ContextMode.EDIT_LINKS:
                    dialogTitle = contextTitle || await TranslationService.translate('Translatable#Edit Links');
                    dialogIcon = dialogIcon || contextIcon;
                    singleTab = true;
                    break;
                case ContextMode.EDIT_ADMIN:
                    dialogTitle = dialogTitle
                        || contextTitle
                        || await TranslationService.translate('Translatable#Edit Core Data');
                    dialogIcon = dialogIcon || 'kix-icon-gear';
                    singleTab = true;
                    break;
                case ContextMode.PERSONAL_SETTINGS:
                    const settingsTitle = await TranslationService.translate('Translatable#Personal Settings', []);
                    dialogTitle = dialogTitle || settingsTitle;
                    dialogIcon = dialogIcon || 'kix-icon-gear';
                    singleTab = true;
                    break;
                case ContextMode.IMPORT:
                    dialogTitle = await TranslationService.translate('Translatable#Import Data');
                    dialogIcon = dialogIcon || 'kix-icon-import';
                    singleTab = true;
                    break;
                default:
                    dialogTitle = 'Dialog';
            }

            const dialogs = await this.getRegisteredDialogs(contextMode, (singleTab ? kixObjectType : null));
            this.activeDialog = dialogs.find((d) => d.kixObjectType === kixObjectType);
            this.mainDialogListener.open(
                dialogTitle,
                dialogs,
                this.activeDialog ? this.activeDialog.instanceId : dialogId,
                dialogIcon
            );
        }
    }

    public closeMainDialog(data?: any): void {
        this.activeDialog = null;
        if (this.mainDialogListener) {
            this.mainDialogListener.close(data);
            if (this.overlayDialogListener) {
                this.overlayDialogListener.close();
            }
        }
        ContextService.getInstance().closeDialogContext();
    }

    public submitMainDialog(data?: any): void {
        if (this.mainDialogListener) {
            this.mainDialogListener.submit(data);
            if (this.overlayDialogListener) {
                this.overlayDialogListener.close();
            }
        }
        ContextService.getInstance().closeDialogContext();

        setTimeout(async () => {
            BrowserCacheService.getInstance().deleteKeys(KIXObjectType.CURRENT_USER);
        }, 500);
    }

    public openOverlayDialog(dialogTagId: string, input?: any, title?: string, icon?: string | ObjectIcon): void {
        if (this.overlayDialogListener) {
            this.overlayDialogListener.open(dialogTagId, input, title, icon);
        }
    }

    public openImageDialog(imageDescriptions: DisplayImageDescription[], shownImageId?: string | number) {
        if (this.imageDialogListener) {
            this.imageDialogListener.open(imageDescriptions, shownImageId);
        }
    }

    public setOverlayDialogLoading(loading: boolean): void {
        if (this.overlayDialogListener) {
            this.overlayDialogListener.setLoading(loading);
        }
    }

    public async getRegisteredDialogs(
        contextMode: ContextMode, objectType?: KIXObjectType | string
    ): Promise<ConfiguredDialogWidget[]> {
        let dialogs = [];

        const descriptors = ContextFactory.getInstance().getContextDescriptors(contextMode, objectType);
        if (descriptors) {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: ''
            });
            for (const descriptor of descriptors) {
                const context = await ContextService.getInstance().getContext(descriptor.contextId);
                if (context && context.getConfiguration() && context.getConfiguration().dialogs) {
                    dialogs = [
                        ...dialogs,
                        ...context.getConfiguration().dialogs.filter(
                            (d) => d.contextMode === contextMode && (objectType ? d.kixObjectType === objectType : true)
                        )
                    ];
                }
            }
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: false
            });
        }
        return dialogs;
    }


    public setMainDialogTitle(title: string): void {
        if (this.mainDialogListener) {
            this.mainDialogListener.setTitle(title);
        }
    }

    public setMainDialogHint(hint: string): void {
        if (this.mainDialogListener) {
            this.mainDialogListener.setHint(hint);
        }
    }

    public setMainDialogLoading(
        isLoading: boolean = false, loadingHint: string = '', showClose: boolean = false,
        time: number = null, cancelCallback: () => void = null
    ): void {
        if (this.mainDialogListener) {
            this.mainDialogListener.setLoading(isLoading, loadingHint, showClose, time, cancelCallback);
        }
    }

    // FIXME: obsolet, DialogEvents.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    public registerDialogResultListener<T>(listenerId: string, component: string, listener: (result: T) => void): void {
        if (this.resultListeners.has(listenerId)) {
            this.addListener<T>(listenerId, component, listener);
        } else {
            this.resultListeners.set(listenerId, [[component, listener]]);
        }
    }

    // FIXME: obsolet, DialogEvents.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    private addListener<T>(dialogId: string, component: string, listener: (result: T) => void): void {
        const listeners = this.resultListeners.get(dialogId);
        const index = listeners.findIndex((l) => l[0] === component);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        listeners.push([component, listener]);
    }

    // FIXME: obsolet, DialogEvents.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    public publishDialogResult<T>(listenerId: string, result: T): void {
        if (this.resultListeners.has(listenerId)) {
            this.resultListeners.get(listenerId).forEach((l) => l[1](result));
        }
    }

}
