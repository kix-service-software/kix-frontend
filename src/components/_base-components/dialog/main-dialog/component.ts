import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { MainDialogComponentState } from './MainDialogComponentState';
import { IMainDialogListener, ContextService } from '@kix/core/dist/browser';
import { ConfiguredDialogWidget } from '@kix/core/dist/model';

export class MainDialogComponent implements IMainDialogListener {

    private state: MainDialogComponentState;

    public onCreate(): void {
        this.state = new MainDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this);
        this.state.dialogWidgets = DialogService.getInstance().getRegisteredDialogs();
    }

    public tabChanged(tab: ConfiguredDialogWidget): void {
        ContextService.getInstance().setDialogContext(null, tab.kixObjectType, tab.contextMode);
    }

    public open(dialogId?: string): void {
        this.state.dialogId = dialogId;
        this.state.show = true;
    }

    public close(): void {
        this.state.show = false;
    }

    public setHint(hint: string): void {
        this.state.dialogHint = hint;
    }

    public setLoading(isLoading: boolean, loadingHint: string): void {
        this.state.isLoading = isLoading;
        this.state.loadingHint = loadingHint;
    }

}

module.exports = MainDialogComponent;
