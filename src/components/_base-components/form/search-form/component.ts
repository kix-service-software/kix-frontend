/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    WidgetType, KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener, CacheState, Error, KIXObjectType
} from '../../../../core/model';
import { FormService } from '../../../../core/browser/form';
import {
    WidgetService, IdService, TableConfiguration, TableHeaderHeight,
    TableRowHeight, BrowserUtil, ITable, TableFactoryService, TableEvent, SearchProperty,
    TableEventData, ObjectPropertyValue
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { SearchContext } from '../../../../core/browser/search/context/SearchContext';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { DialogService } from '../../../../core/browser/components/dialog';
import { SearchService } from '../../../../core/browser/kix/search/SearchService';

class Component implements ISearchFormListener {

    private state: ComponentState;
    private formId: string;
    private objectType: KIXObjectType;

    public listenerId: string;

    private subscriber: IEventSubscriber;

    private keyListenerElement: any;
    private keyListener: any;

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

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Attributes", "Translatable#Reset data", "Translatable#Cancel",
            "Translatable#Detailed search results", "Translatable#Start search"
        ]);

        this.state.table = await this.createTable();

        if (SearchService.getInstance().getSearchCache()) {
            const cache = SearchService.getInstance().getSearchCache();
            if (cache.status === CacheState.VALID && cache.objectType === this.objectType) {
                SearchService.getInstance().provideResult(this.objectType);
                await this.setCanSearch();
            } else {
                this.formReset();
            }
        }

        this.subscriber = {
            eventSubscriberId: 'search-result-list',
            eventPublished: async (data: TableEventData, eventId: string) => {
                if (this.state.table) {
                    if (data && data.tableId === this.state.table.getTableId()) {
                        if (eventId === TableEvent.TABLE_INITIALIZED) {
                            await this.setAdditionalColumns();
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.subscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.registerSearchFormListener(this);
            const searchDefinition = SearchService.getInstance().getSearchDefinition(formInstance.getObjectType());
            this.state.manager = searchDefinition.formManager;
            this.state.manager.reset();

            const cache = SearchService.getInstance().getSearchCache();
            if (cache && cache.status === CacheState.VALID && cache.objectType === this.objectType) {
                for (const criteria of cache.criteria) {
                    this.state.manager.setValue(
                        new ObjectPropertyValue(criteria.property, criteria.operator, criteria.value)
                    );
                }
            } else {
                await this.setDefaults(formInstance);
            }

            this.state.manager.registerListener(this.listenerId, () => {
                formInstance.clearCriteria();
                const values = this.state.manager.getValues();
                values.forEach((v) => formInstance.setFilterCriteria(searchDefinition.getFilterCriteria(v)));
            });
        }

        this.keyListenerElement = (this as any).getEl();
        if (this.keyListenerElement) {
            this.keyListener = this.keyDown.bind(this);
            this.keyListenerElement.addEventListener('keydown', this.keyListener);
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.removeSearchFormListener(this.listenerId);
        }
        TableFactoryService.getInstance().destroyTable(`search-form-results-${this.objectType}`);

        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.keyDown.bind(this));
        }
    }

    private async setDefaults(formInstance: SearchFormInstance): Promise<void> {
        const defaultProperties = formInstance.form.defaultSearchProperties;
        if (defaultProperties) {
            for (const p of defaultProperties) {
                const operators = await this.state.manager.getOperations(p);
                this.state.manager.setValue(new ObjectPropertyValue(p, operators ? operators[0] : null, null));
            }
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

    public async formReset(): Promise<void> {
        this.state.prepared = false;
        SearchService.getInstance().provideResult(this.objectType, []);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            formInstance.reset();
        }

        if (this.state.manager) {
            this.state.manager.reset();
            this.setDefaults(formInstance);
        }
        setTimeout(() => {
            this.state.prepared = true;
        }, 50);
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        const hint = await TranslationService.translate('Translatable#Search');
        DialogService.getInstance().setMainDialogLoading(true, hint, true);

        const result = await SearchService.getInstance().executeSearch<KIXObject>(this.formId)
            .catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
            });

        await this.setAdditionalColumns();

        this.state.resultCount = Array.isArray(result) ? result.length : 0;
        (this as any).setStateDirty();

        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async setAdditionalColumns(): Promise<void> {
        const searchCache = SearchService.getInstance().getSearchCache();
        const parameter: Array<[string, any]> = [];
        if (searchCache && searchCache.status === CacheState.VALID && searchCache.objectType === this.objectType) {
            for (const c of searchCache.criteria) {
                if (c.property !== SearchProperty.FULLTEXT) {
                    parameter.push([c.property, c.value]);
                }
            }
        }

        const searchDefinition = SearchService.getInstance().getSearchDefinition(this.objectType);
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

    private async createTable(): Promise<ITable> {
        const tableConfiguration = new TableConfiguration(
            this.objectType, null, null, null, false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            `search-form-results-${this.objectType}`, this.objectType, tableConfiguration,
            null, SearchContext.CONTEXT_ID, true, false, true, true
        );

        return table;
    }
}

module.exports = Component;
