import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../core/browser';
import { ConfiguredDialogWidget, ObjectIcon, ContextType } from '../../../../core/model';
import { EventService } from '../../../../core/browser/event';
import {
    IMainDialogListener, DialogService, DialogEvents, DialogEventData
} from '../../../../core/browser/components/dialog';

export class MainDialogComponent implements IMainDialogListener {

    private state: ComponentState;

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
            this.state.isLoading = true;
            this.state.dialogTitle = dialogTitle;
            this.state.dialogIcon = dialogIcon;
            this.state.dialogWidgets = dialogs;
            this.state.show = true;
            this.state.dialogId = dialogId;
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                this.state.isLoading = false;
            }, 100);
        }
    }

    public close(data?: any): void {
        this.state.show = false;
        document.body.style.overflow = 'unset';
        const context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
        if (context) {
            EventService.getInstance().publish(
                DialogEvents.DIALOG_CANCELED,
                new DialogEventData(this.state.dialogId, data),
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
                new DialogEventData(this.state.dialogId, data),
                context.getDialogSubscriberId()
            );
        }
    }

    public async tabChanged(tab: ConfiguredDialogWidget): Promise<void> {
        if (tab) {
            await ContextService.getInstance().setDialogContext(null, tab.kixObjectType, tab.contextMode);
            this.state.dialogId = tab.instanceId;
        }
    }

    public setTitle(title: string): void {
        this.state.dialogTitle = title;
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
