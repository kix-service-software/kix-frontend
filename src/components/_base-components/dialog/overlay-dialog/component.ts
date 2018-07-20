import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { OverlayDialogComponentState } from './OverlayDialogComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { ObjectIcon, Context, WidgetType } from '@kix/core/dist/model';
import { WidgetService } from '@kix/core/dist/browser';

export class OverlayDialogComponent {

    private state: OverlayDialogComponentState;

    public onCreate(): void {
        this.state = new OverlayDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerOverlayDialogListener(this.openOverlayDialog.bind(this));
        WidgetService.getInstance().setWidgetType('overlay-dialog', WidgetType.OVERLAY_DIALOG);
    }

    public openOverlayDialog(dialogTagId?: string, input?: any, title?: string, icon?: string | ObjectIcon): void {
        this.state.dialogTemplate = ComponentsService.getInstance().getComponentTemplate(dialogTagId);
        this.state.dialogInput = input;
        this.state.title = title;
        this.state.icon = icon;
        this.state.show = true;
    }

    public closeDialog(): void {
        this.state.show = false;
    }

}

module.exports = OverlayDialogComponent;
