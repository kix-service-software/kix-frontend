import { DialogService } from '@kix/core/dist/browser/DialogService';
import { MainDialogComponentState } from './MainDialogComponentState';

export class MainDialogComponent {

    private state: MainDialogComponentState;

    public onCreate(): void {
        this.state = new MainDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this.toggleMainDialog.bind(this));
        DialogService.getInstance().registerMainDialogHintListener(this.setMainDialogHint.bind(this));
        this.state.dialogWidgets = DialogService.getInstance().getRegisteredDialogs();
    }

    private async toggleMainDialog(dialogTagId?: string, input?: any, close?: boolean): Promise<void> {
        if (close) {
            this.state.show = false;
        } else {
            this.state.show = true;
        }
    }

    private setMainDialogHint(hint: string): void {
        this.state.dialogHint = hint;
    }

    private closeDialog(): void {
        this.state.show = false;
    }

}

module.exports = MainDialogComponent;
