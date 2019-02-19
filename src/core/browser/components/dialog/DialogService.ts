import { ObjectIcon, ConfiguredDialogWidget, ContextMode, ContextType, KIXObjectType } from "../../../model";
import { IMainDialogListener } from ".";
import { IOverlayDialogListener } from "./IOverlayDialogListener";
import { DisplayImageDescription } from "../../components/DisplayImageDescription";
import { IImageDialogListener } from "./IImageDialogListener";
import { ContextService } from '../../context';

export class DialogService {

    private static INSTANCE: DialogService = null;

    private mainDialogListener: IMainDialogListener;
    private resultListeners: Map<string, Array<[string, (result: any) => void]>> = new Map();

    private overlayDialogListener: IOverlayDialogListener;

    private imageDialogListener: IImageDialogListener;

    private dialogs: ConfiguredDialogWidget[] = [];

    private constructor() { }

    public static getInstance(): DialogService {
        if (!DialogService.INSTANCE) {
            DialogService.INSTANCE = new DialogService();
        }

        return DialogService.INSTANCE;
    }

    public registerDialog(dialogWidget: ConfiguredDialogWidget): void {
        this.dialogs.push(dialogWidget);
    }

    public unregisterDialog(instanceId: string): void {
        const index = this.dialogs.findIndex((d) => d.instanceId === instanceId);
        if (index !== -1) {
            this.dialogs.splice(index, 1);
        }
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
        kixObjectType?: KIXObjectType,
        title?: string,
        dialogIcon?: string | ObjectIcon,
        singleTab: boolean = false
    ): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        const contextIcon = context ? context.getIcon() : null;
        const contextTitle = context ? await context.getDisplayText() : '';

        let dialogTitle = title;
        if (this.mainDialogListener) {
            switch (contextMode) {
                case ContextMode.CREATE:
                    dialogTitle = dialogTitle || 'Neues Objekt anlegen';
                    dialogIcon = dialogIcon || 'kix-icon-plus-blank';
                    break;
                case ContextMode.CREATE_SUB:
                    dialogTitle = contextTitle || dialogTitle || 'Neues Objekt anlegen';
                    dialogIcon = contextIcon || dialogIcon || 'kix-icon-unknown';
                    break;
                case ContextMode.CREATE_ADMIN:
                    dialogTitle = dialogTitle || 'Objekt hinzufügen';
                    dialogIcon = dialogIcon || 'kix-icon-plus-blank';
                    singleTab = true;
                    break;
                case ContextMode.SEARCH:
                    dialogTitle = dialogTitle || 'Komplexsuche';
                    dialogIcon = dialogIcon || 'kix-icon-search';
                    break;
                case ContextMode.EDIT:
                    dialogTitle = contextTitle || 'Objekt bearbeiten';
                    dialogIcon = dialogIcon || contextIcon;
                    singleTab = true;
                    break;
                case ContextMode.EDIT_BULK:
                    dialogTitle = 'Sammelaktion';
                    dialogIcon = dialogIcon || 'kix-icon-arrow-collect';
                    singleTab = true;
                    break;
                case ContextMode.EDIT_LINKS:
                    dialogTitle = contextTitle || 'Verknüpfungen bearbeiten';
                    dialogIcon = dialogIcon || contextIcon;
                    singleTab = true;
                    break;
                case ContextMode.EDIT_ADMIN:
                    dialogTitle = dialogTitle || 'Stammdaten bearbeiten';
                    dialogIcon = dialogIcon || 'kix-icon-edit';
                    singleTab = true;
                    break;
                case ContextMode.PERSONAL_SETTINGS:
                    dialogTitle = dialogTitle || 'Persönliche Einstellungen';
                    dialogIcon = dialogIcon || 'kix-icon-gear';
                    singleTab = true;
                    break;
                default:
                    dialogTitle = 'Dialog';
            }

            this.mainDialogListener.open(
                dialogTitle,
                this.getRegisteredDialogs(contextMode, (singleTab ? kixObjectType : null)),
                dialogId, dialogIcon);
        }
    }

    public closeMainDialog(data?: any): void {
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

    public getRegisteredDialogs(contextMode: ContextMode, objectType?: KIXObjectType): ConfiguredDialogWidget[] {
        return this.dialogs.filter(
            (d) => d.contextMode === contextMode && (objectType ? d.kixObjectType === objectType : true)
        );
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

    // FIXME: obsolet, DialogEvnets.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    public registerDialogResultListener<T>(listenerId: string, component: string, listener: (result: T) => void): void {
        if (this.resultListeners.has(listenerId)) {
            this.addListener<T>(listenerId, component, listener);
        } else {
            this.resultListeners.set(listenerId, [[component, listener]]);
        }
    }

    // FIXME: obsolet, DialogEvnets.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    private addListener<T>(dialogId: string, component: string, listener: (result: T) => void): void {
        const listeners = this.resultListeners.get(dialogId);
        const index = listeners.findIndex((l) => l[0] === component);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        listeners.push([component, listener]);
    }

    // FIXME: obsolet, DialogEvnets.DIALOG_CANCELED bzw. .DIALOG_FINISHED verwenden
    public publishDialogResult<T>(listenerId: string, result: T): void {
        if (this.resultListeners.has(listenerId)) {
            this.resultListeners.get(listenerId).forEach((l) => l[1](result));
        }
    }

}
