import { ComponentState } from './ComponentState';
import { DialogService, OverlayService, WidgetService } from '@kix/core/dist/browser';
import { ComponentContent, OverlayType, StringContent, WidgetType } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        WidgetService.getInstance().setWidgetType('link-objects-preview-table', WidgetType.GROUP);
    }

    public getResultTitle(): string {
        return `Vorhandene Verknüpfungen (${this.state.linkObjectCount})`;
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Verknüpfungen werden aktualisiert.");
        setTimeout(() => {
            this.showSuccessHint();
            DialogService.getInstance().closeMainDialog();
            DialogService.getInstance().setMainDialogLoading(false);
        }, 1500);
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'Verknüpfungen aktualisiert.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }



}

module.exports = Component;
