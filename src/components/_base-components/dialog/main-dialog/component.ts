import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { MainDialogComponentState } from './MainDialogComponentState';
import { IMainDialogListener, ContextService } from '@kix/core/dist/browser';
import { ContextType, ConfiguredWidget, ConfiguredDialogWidget } from '@kix/core/dist/model';

export class MainDialogComponent implements IMainDialogListener {

    private state: MainDialogComponentState;

    public onCreate(): void {
        this.state = new MainDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerMainDialogListener(this);
        this.state.dialogWidgets = DialogService.getInstance().getRegisteredDialogs();

        let dialogWidget = this.state.dialogWidgets && this.state.dialogWidgets.length
            ? this.state.dialogWidgets[0]
            : null;

        if (this.state.dialogId) {
            dialogWidget =
                this.state.dialogWidgets.find((dw) => dw.configuration.widgetId === this.state.dialogId);
        }

        if (dialogWidget) {
            ContextService.getInstance().setDialogContext(dialogWidget.kixObjectType, dialogWidget.contextMode);
        }
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

    public tabChanged(widget: ConfiguredDialogWidget): void {
        ContextService.getInstance().setDialogContext(widget.kixObjectType, widget.contextMode);
    }

}

module.exports = MainDialogComponent;
