import { WidgetType, OverlayType, StringContent, KIXObject } from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import {
    WidgetService, DialogService, KIXObjectSearchService, OverlayService, KIXObjectServiceRegistry
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any) {
        this.state.formId = input.formId;
        this.state.objectType = input.objectType;
    }

    public onMount(): void {
        WidgetService.getInstance().setWidgetType('result-list-preview', WidgetType.GROUP);
        const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(this.state.objectType);
        this.state.table = objectService.getObjectTable();
    }

    public reset(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Suche ...");
        await KIXObjectSearchService.getInstance().executeSearch<KIXObject>(this.state.formId)
            .then((objects) => {
                this.state.table.contentLayer.setPreloadedObjects(objects);
                this.state.resultCount = objects ? objects.length : 0;
                this.state.table.loadRows(false);
            })
            .catch((error) => {
                this.showError(error);
            });
        DialogService.getInstance().setMainDialogLoading(false);
    }

    public submit(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public removeValue(): void {
        return;
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public getResultTitle(): string {
        return `Trefferliste (${this.state.resultCount})`;
    }

}

module.exports = Component;
