import {
    WidgetType, OverlayType, StringContent,
    KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener
} from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import {
    WidgetService, DialogService, KIXObjectSearchService, OverlayService, KIXObjectServiceRegistry,
    IdService, StandardTableFactoryService, TableConfiguration, TableHeaderHeight,
    TableRowHeight
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component implements ISearchFormListener {

    private state: ComponentState;
    public listenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-form-');
    }

    public onInput(input: any) {
        this.state.formId = input.formId;
        this.state.objectType = input.objectType;
    }

    public onMount(): void {
        WidgetService.getInstance().setWidgetType('result-list-preview', WidgetType.GROUP);
        const tableConfiguration = new TableConfiguration(
            null, 5, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        this.state.table = StandardTableFactoryService.getInstance().createStandardTable(
            this.state.objectType, tableConfiguration, null, null, true
        );

        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            this.state.fulltextSearch = formInstance.form.fulltextSearch;
            this.state.fulltextActive = this.state.fulltextSearch;
            this.state.defaultProperties = formInstance.form.defaultSearchProperties;

            formInstance.registerSearchFormListener(this);
        }

        if (KIXObjectSearchService.getInstance().getSearchCache()) {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache.objectType === this.state.objectType) {
                this.state.fulltextActive = cache.isFulltext;
                this.state.fulltextValue = cache.fulltextValue;
                this.setSearchResult(cache.result);
                this.setCanSearch();
            } else {
                KIXObjectSearchService.getInstance().clearSearchCache();
            }
        }

        this.state.loading = false;
    }

    public onDestroy(): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            formInstance.removeSearchFormListener(this.listenerId);
        }
    }

    public keyDown(event: any): void {
        if ((event.keyCode === 13 || event.key === 'Enter') && this.state.canSearch) {
            if (event.preventDefault) {
                event.preventDefault(event);
            }
            this.search();
        }
    }

    public fulltextValueChanged(event: any): void {
        this.state.fulltextValue = event.target.value;
        this.setCanSearch();
    }

    public reset(): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }

        this.state.fulltextValue = null;
        KIXObjectSearchService.getInstance().clearSearchCache();
        this.setSearchResult([]);
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
        if (this.state.fulltextActive) {
            const fulltextInput = (this as any).getEl('fulltext-input');
            if (fulltextInput) {
                fulltextInput.focus();
            }
        }
        this.setCanSearch();
    }

    private setSearchResult(objects: KIXObject[]): void {
        this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
        this.state.resultCount = objects ? objects.length : 0;

        const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(this.state.objectType);
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        const objectProperties = searchCache ? searchCache.criteria.map((c) => c.property) : [];
        const columns = objectService.getTableColumnConfiguration(objectProperties);
        this.state.table.setColumns(columns);

        this.state.table.loadRows();
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    private setCanSearch(): void {
        if (this.state.fulltextActive) {
            this.state.canSearch = !!this.state.fulltextValue;
        } else {
            const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
            if (formInstance) {
                this.state.canSearch = formInstance.getCriteria().some(
                    (c) => c.property !== null && c.operator !== null && c.value !== null
                );
            }
        }
    }

    public searchCriteriaChanged(criteria: FilterCriteria[]): void {
        this.setCanSearch();
    }
}

module.exports = Component;
