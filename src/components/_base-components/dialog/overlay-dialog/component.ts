import { ComponentState } from './ComponentState';
import { ObjectIcon, WidgetType } from '../../../../core/model';
import { WidgetService, IOverlayDialogListener, DialogService, ComponentsService } from '../../../../core/browser';

export class OverlayDialogComponent implements IOverlayDialogListener {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
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
        this.state.loading = true;

        setTimeout(() => {
            this.state.loading = false;
        }, 200);
    }

    public close(): void {
        this.state.show = false;
    }

    public setLoading(loading: boolean): void {
        this.state.loading = loading;
    }

}

module.exports = OverlayDialogComponent;
