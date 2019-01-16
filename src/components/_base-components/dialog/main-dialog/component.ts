import { DialogService } from '../../../../core/browser/dialog/DialogService';
import { ComponentState } from './ComponentState';
import { IMainDialogListener, ContextService } from '../../../../core/browser';
import { ConfiguredDialogWidget, ObjectIcon } from '../../../../core/model';

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

    public close(): void {
        this.state.show = false;
        document.body.style.overflow = 'unset';
        ContextService.getInstance().closeDialogContext();
    }

    public tabChanged(tab: ConfiguredDialogWidget): void {
        if (tab) {
            this.state.dialogId = tab.instanceId;
            ContextService.getInstance().setDialogContext(null, tab.kixObjectType, tab.contextMode);
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
