import {
    WidgetType, OverlayType, StringContent,
    KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener, CacheState, Error
} from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import {
    WidgetService, DialogService, KIXObjectSearchService, OverlayService, ServiceRegistry,
    IdService, StandardTableFactoryService, TableConfiguration, TableHeaderHeight,
    TableRowHeight, IKIXObjectService, StandardTable, SearchProperty, BrowserUtil
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';

class Component implements ISearchFormListener {

    private state: ComponentState;
    private formId: string;

    public listenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-form-');
        WidgetService.getInstance().setWidgetType('search-form-group', WidgetType.GROUP);
    }

    public onInput(input: any) {
        this.formId = input.formId;
        this.state.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {
        this.state.table = this.createTable();

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.registerSearchFormListener(this);
        }

        if (KIXObjectSearchService.getInstance().getSearchCache()) {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache.status === CacheState.VALID && cache.objectType === this.state.objectType) {
                await this.setSearchResult(cache.result);
                await this.setCanSearch();
            } else {
                this.reset();
            }
        }
    }

    public async onDestroy(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.removeSearchFormListener(this.listenerId);
        }
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.VALID;
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

    public formReseted(): void {
        return;
    }

    public async reset(): Promise<void> {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.INVALID;
        }

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.reset();
        }

        await this.setSearchResult([]);
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Suche ...", true);

        await KIXObjectSearchService.getInstance().executeSearch<KIXObject>(this.formId)
            .then((objects) => {
                this.setSearchResult(objects);
            })
            .catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
            });

        DialogService.getInstance().setMainDialogLoading(false);
    }

    public submit(): void {
        if (this.state.resultCount) {
            DialogService.getInstance().submitMainDialog();
        }
    }

    public removeValue(): void {
        return;
    }

    private async setSearchResult(objects: KIXObject[]): Promise<void> {
        this.state.table = null;

        const table = this.createTable();
        table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
        table.tableConfiguration.routingConfiguration.externalLink = false;

        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        const parameter: Array<[string, any]> = [];
        if (searchCache
            && searchCache.status === CacheState.VALID
            && searchCache.objectType === this.state.objectType
        ) {
            for (const c of searchCache.criteria) {
                if (c.property !== SearchProperty.FULLTEXT) {
                    parameter.push([c.property, c.value]);
                }
            }
        }

        const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.state.objectType);

        const columns = await searchDefinition.getTableColumnConfiguration(parameter);
        table.setColumns(columns);

        await table.loadRows();

        setTimeout(() => {
            this.state.resultCount = objects ? objects.length : 0;
            this.state.table = table;
        }, 100);
    }

    private async setCanSearch(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            this.state.canSearch = formInstance.getCriteria().some(
                (c) => c.property !== null && c.operator !== null
                    && c.value !== null && c.value !== '' && !/^\s+$/.test(c.value.toString())
            );
        }
    }

    public async searchCriteriaChanged(criteria: FilterCriteria[]): Promise<void> {
        await this.setCanSearch();
    }

    private createTable(): StandardTable {
        const tableConfiguration = new TableConfiguration(
            null, null, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            this.state.objectType, tableConfiguration, null, null, true, null, true
        );
        return table;
    }
}

module.exports = Component;
