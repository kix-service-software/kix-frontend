import {
    WidgetType, OverlayType, StringContent,
    KIXObject, SearchFormInstance, FilterCriteria
} from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import {
    WidgetService, DialogService, KIXObjectSearchService,
    OverlayService, KIXObjectServiceRegistry, IKIXObjectSearchListener
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component implements IKIXObjectSearchListener {

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
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            this.state.fulltextSearch = formInstance.form.fulltextSearch;
            this.state.fulltextActive = this.state.fulltextSearch;
            this.state.defaultProperties = formInstance.form.defaultSearchProperties;
        }
        this.state.loading = false;
    }

    public fulltextValueChanged(event: any): void {
        this.state.fulltextValue = event.target.value;
    }

    public reset(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }

        KIXObjectSearchService.getInstance().clearSearchCache();
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Suche ...");
        if (this.state.fulltextActive) {
            if (this.state.fulltextValue && this.state.fulltextValue !== '') {
                await KIXObjectSearchService.getInstance()
                    .executeFullTextSearch<KIXObject>(this.state.objectType, this.state.fulltextValue)
                    .then((objects) => {
                        this.setSearchResult(objects);
                    })
                    .catch((error) => {
                        this.showError(error);
                    });
            }
        } else {
            await KIXObjectSearchService.getInstance().executeSearch<KIXObject>(this.state.formId)
                .then((objects) => {
                    this.setSearchResult(objects);
                })
                .catch((error) => {
                    this.showError(error);
                });
        }
        DialogService.getInstance().setMainDialogLoading(false);
    }

    public submit(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public removeValue(): void {
        return;
    }

    public getResultTitle(): string {
        return `Trefferliste (${this.state.resultCount})`;
    }

    public toggleFulltext(enable: boolean): void {
        this.state.fulltextActive = enable;
    }

    private setSearchResult(objects: KIXObject[]): void {
        this.state.table.contentLayer.setPreloadedObjects(objects);
        this.state.resultCount = objects ? objects.length : 0;

        const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(this.state.objectType);
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        const objectProperties = searchCache.criterias.map((c) => c.property);
        const columns = objectService.getTableColumnConfiguration(objectProperties);
        this.state.table.setColumns(columns);

        this.state.table.loadRows(false);
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    public searchCleared(): void {
        this.state.canSearch = false;
    }

    public searchFinished<T extends KIXObject<any> = KIXObject<any>>(result: T[]): void {
        return;
    }

    public searchCriteriasChanged(criterias: FilterCriteria[]): void {
        this.state.canSearch = !criterias.some((c) => c.value === null);
    }

}

module.exports = Component;
