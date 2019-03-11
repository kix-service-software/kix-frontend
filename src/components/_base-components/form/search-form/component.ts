import {
    WidgetType, KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener, CacheState, Error, KIXObjectType
} from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import {
    WidgetService, KIXObjectSearchService, IdService, TableConfiguration, TableHeaderHeight,
    TableRowHeight, BrowserUtil, ITable, TableFactoryService, TableEvent, SearchProperty, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchContext } from '../../../../core/browser/search/context';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';

class Component implements ISearchFormListener {

    private state: ComponentState;
    private formId: string;
    private objectType: KIXObjectType;

    public listenerId: string;

    private subscriber: IEventSubscriber;
    private table: ITable;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-form-');
        WidgetService.getInstance().setWidgetType('search-form-group', WidgetType.GROUP);
    }

    public onInput(input: any) {
        this.formId = input.formId;
        this.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {
        this.state.table = this.createTable();

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.registerSearchFormListener(this);
        }

        if (KIXObjectSearchService.getInstance().getSearchCache()) {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache.status === CacheState.VALID && cache.objectType === this.objectType) {
                KIXObjectSearchService.getInstance().provideResult();
                await this.setCanSearch();
            } else {
                this.reset();
            }
        }

        this.subscriber = {
            eventSubscriberId: 'search-result-list',
            eventPublished: async (data: TableEventData, eventId: string) => {
                if (this.table) {
                    if (data && data.tableId === this.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_READY) {
                            this.state.resultCount = this.table.getRows().length;
                        }

                        if (eventId === TableEvent.TABLE_INITIALIZED) {
                            await this.setAdditionalColumns();
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
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
                event.preventDefault();
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

        KIXObjectSearchService.getInstance().provideResult([]);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.reset();
        }
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        const hint = await TranslationService.translate('Translatable#Search ...');
        DialogService.getInstance().setMainDialogLoading(true, hint, true);

        await KIXObjectSearchService.getInstance().executeSearch<KIXObject>(this.formId)
            .catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
            });

        await this.setAdditionalColumns();

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async setAdditionalColumns(): Promise<void> {
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        const parameter: Array<[string, any]> = [];
        if (searchCache && searchCache.status === CacheState.VALID && searchCache.objectType === this.objectType) {
            for (const c of searchCache.criteria) {
                if (c.property !== SearchProperty.FULLTEXT) {
                    parameter.push([c.property, c.value]);
                }
            }
        }

        const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.objectType);
        const columns = await searchDefinition.getTableColumnConfiguration(parameter);
        this.state.table.addColumns(columns);
    }

    public submit(): void {
        if (this.state.resultCount) {
            DialogService.getInstance().submitMainDialog();
        }
    }

    public removeValue(): void {
        return;
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

    private createTable(): ITable {
        const tableConfiguration = new TableConfiguration(
            this.objectType, null, null, null, null, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        this.table = TableFactoryService.getInstance().createTable(
            `search-form-results-${this.objectType}`, this.objectType, tableConfiguration,
            null, SearchContext.CONTEXT_ID, true, false, true
        );

        KIXObjectSearchService.getInstance().provideResult();

        return this.table;
    }
}

module.exports = Component;
