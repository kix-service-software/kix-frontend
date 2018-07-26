import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { OverlayDialogComponentState } from './OverlayDialogComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { ObjectIcon, WidgetType } from '@kix/core/dist/model';
import { WidgetService, IOverlayDialogListener } from '@kix/core/dist/browser';

export class OverlayDialogComponent implements IOverlayDialogListener {

    private state: OverlayDialogComponentState;

    public onCreate(): void {
        this.state = new OverlayDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerOverlayDialogListener(this);
        WidgetService.getInstance().setWidgetType('overlay-dialog', WidgetType.OVERLAY_DIALOG);
    }

    public open(dialogTagId?: string, input?: any, title?: string, icon?: string | ObjectIcon): void {
        this.state.dialogTemplate = ComponentsService.getInstance().getComponentTemplate(dialogTagId);
        this.state.dialogInput = input;
        this.state.title = title;
        this.state.icon = icon;
        this.state.show = true;
    }

    public close(): void {
        this.state.show = false;
    }
}

module.exports = OverlayDialogComponent;
