import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { MainDialogComponentState } from './MainDialogComponentState';
import { IMainDialogListener } from '@kix/core/dist/browser';

export class MainDialogComponent implements IMainDialogListener {

    private state: MainDialogComponentState;

    public onCreate(): void {
        this.state = new MainDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this);
        this.state.dialogWidgets = DialogService.getInstance().getRegisteredDialogs();
    }

    public open(dialogTagId?: string, input?: any): void {
        this.state.show = true;
    }

    public close(): void {
        this.state.show = false;
    }

    public setHint(hint: string): void {
        this.state.dialogHint = hint;
    }

    public setLoading(isLoading: boolean): void {
        this.state.isLoading = isLoading;
    }


}

module.exports = MainDialogComponent;
