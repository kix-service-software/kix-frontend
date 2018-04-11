import { DialogService } from '@kix/core/dist/browser/DialogService';
import { DialogMainComponentState } from './DialogMainComponentState';

export class MainDialogComponent {

    private state: DialogMainComponentState;

    public onCreate(): void {
        this.state = new DialogMainComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().addServiceListener(this.dialogStateChanged.bind(this));
        this.state.dialogWidgets = DialogService.getInstance().getRegisteredDialogs();
        this.state.dialogHint = DialogService.getInstance().getDialogHint();
    }

    private async  dialogStateChanged(): Promise<void> {
        this.state.show = DialogService.getInstance().isShowMainDialog();
        this.state.dialogHint = DialogService.getInstance().getDialogHint();
    }

    private closeDialog(): void {
        DialogService.getInstance().toggleMainDialog();
    }

}

module.exports = MainDialogComponent;
