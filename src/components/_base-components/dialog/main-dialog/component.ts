import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../core/browser';
import { ConfiguredDialogWidget, ObjectIcon, ContextType } from '../../../../core/model';
import { EventService } from '../../../../core/browser/event';
import {
    IMainDialogListener, DialogService, DialogEvents, DialogEventData
} from '../../../../core/browser/components/dialog';

export class MainDialogComponent implements IMainDialogListener {

    private state: ComponentState;

    private dialogId: string;
    public dialogWidgets: ConfiguredDialogWidget[] = [];
    public dialogTitle: string = null;
    public dialogIcon: string | ObjectIcon = null;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this);
    }

    public open(
        dialogTitle: string, dialogs: ConfiguredDialogWidget[], dialogId?: string, dialogIcon?: string | ObjectIcon
    ): void {
        if (!this.state.show) {
            this.dialogTitle = dialogTitle;
            this.dialogIcon = dialogIcon;
            this.dialogWidgets = dialogs || [];
            this.dialogId = dialogId;
            document.body.style.overflow = 'hidden';
            this.state.show = true;
        }
    }

    public close(data?: any): void {
        this.state.show = false;
        document.body.style.overflow = 'unset';
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context) {
            EventService.getInstance().publish(
                DialogEvents.DIALOG_CANCELED,
                new DialogEventData(this.dialogId, data),
                context.getDialogSubscriberId()
            );
        }
        if (data && data.byX) {
            ContextService.getInstance().closeDialogContext();
        }
    }

    public submit(data?: any): void {
        this.state.show = false;
        document.body.style.overflow = 'unset';
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context) {
            EventService.getInstance().publish(
                DialogEvents.DIALOG_FINISHED,
                new DialogEventData(this.dialogId, data),
                context.getDialogSubscriberId()
            );
        }
    }

    public async tabChanged(tab: ConfiguredDialogWidget): Promise<void> {
        if (tab) {
            await ContextService.getInstance().setDialogContext(null, tab.kixObjectType, tab.contextMode);
            this.dialogId = tab.instanceId;
        }
    }

    public setTitle(title: string): void {
        this.dialogTitle = title;
    }

    public setHint(hint: string): void {
        this.state.dialogHint = hint;
    }

    public setLoading(
        isLoading: boolean, loadingHint: string, showClose: boolean = false,
        time: number = null, cancelCallback: () => void
    ): void {
        this.state.loadingHint = loadingHint;
        this.state.isLoading = isLoading;
        this.state.showClose = showClose;
        this.state.time = time;
        this.state.cancelCallback = cancelCallback;
    }

}

module.exports = MainDialogComponent;
