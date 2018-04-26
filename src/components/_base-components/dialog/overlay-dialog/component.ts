import { DialogService } from '@kix/core/dist/browser/DialogService';
import { OverlayDialogComponentState } from './OverlayDialogComponentState';
import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { ObjectIcon, Context, WidgetType } from '@kix/core/dist/model';

export class OverlayDialogComponent {

    private state: OverlayDialogComponentState;

    public onCreate(): void {
        this.state = new OverlayDialogComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerOverlayDialogListener(this.openOverlayDialog.bind(this));
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
    }

    private contextNotified(contextId: string, type: ContextNotification, context: Context<any>): void {
        if (type === ContextNotification.CONTEXT_CHANGED) {
            context.setWidgetType('overlay-dialog', WidgetType.OVERLAY_DIALOG);
        }
    }

    private openOverlayDialog(dialogTagId?: string, input?: any, title?: string, icon?: string | ObjectIcon): void {
        this.state.dialogTemplate = ComponentsService.getInstance().getComponentTemplate(dialogTagId);
        this.state.dialogInput = input;
        this.state.title = title;
        this.state.icon = icon;
        this.state.show = true;
    }

    private closeDialog(): void {
        this.state.show = false;
    }

}

module.exports = OverlayDialogComponent;
