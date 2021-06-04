/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ISearchFormListener } from '../../../../../modules/base-components/webapp/core/ISearchFormListener';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { TableEventData, TableEvent, TableFactoryService, Table } from '../../core/table';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { SearchFormInstance } from '../../../../../modules/base-components/webapp/core/SearchFormInstance';
import { SearchService, SearchContext } from '../../../../search/webapp/core';
import { CacheState } from '../../../../search/model/CacheState';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { Error } from '../../../../../../../server/model/Error';
import { ContextService } from '../../core/ContextService';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { LoadingShieldEventData } from '../../core/LoadingShieldEventData';
import { ValidationResult } from '../../core/ValidationResult';
import { ComponentContent } from '../../core/ComponentContent';
import { OverlayService } from '../../core/OverlayService';
import { OverlayType } from '../../core/OverlayType';
import { ValidationSeverity } from '../../core/ValidationSeverity';

class Component implements ISearchFormListener {

    private state: ComponentState;
    private formId: string;
    private objectType: KIXObjectType | string;

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
            'Translatable#Attributes', 'Translatable#Reset data', 'Translatable#Cancel',
            'Translatable#Detailed search results', 'Translatable#Start search'
        ]);

        this.state.table = await this.createTable();

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

        SearchFormInstance.getInstance().reset();
        await SearchFormInstance.getInstance().setForm(this.formId);
        SearchFormInstance.getInstance().registerSearchFormListener(this);
        const searchDefinition = SearchService.getInstance().getSearchDefinition(
            SearchFormInstance.getInstance().getObjectType()
        );
        this.state.manager = searchDefinition.formManager;

        const cache = SearchService.getInstance().getSearchCache();
        if (cache && cache.objectType === this.objectType) {
            if (cache.status === CacheState.VALID) {
                SearchService.getInstance().provideResult(this.objectType);
                this.state.resultCount = cache.result.length;
                this.state.limit = cache.limit;

                await this.setCanSearch();
                this.state.manager.reset(false);
                for (const criteria of cache.criteria) {
                    this.state.manager.setValue(
                        new ObjectPropertyValue(criteria.property, criteria.operator, criteria.value)
                    );
                }
            } else {
                await this.setDefaults();
            }
        } else {
            await this.setDefaults();
        }

        this.state.manager.registerListener(this.listenerId, () => {
            SearchFormInstance.getInstance().clearCriteria();
            const values = this.state.manager.getValues();
            values.forEach((v) => SearchFormInstance.getInstance().setFilterCriteria(
                searchDefinition.getFilterCriteria(v))
            );
        });

        this.keyListenerElement = (this as any).getEl();
        if (this.keyListenerElement) {
            this.keyListener = this.keyDown.bind(this);
            this.keyListenerElement.addEventListener('keydown', this.keyListener);
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.subscriber);
        SearchFormInstance.getInstance().removeSearchFormListener(this.listenerId);
        TableFactoryService.getInstance().destroyTable(`search-form-results-${this.objectType}`);

        if (this.keyListenerElement) {
            this.keyListenerElement.removeEventListener('keydown', this.keyDown.bind(this));
        }
    }

    private async setDefaults(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const defaultProperties = (SearchFormInstance.getInstance().getForm() as any).defaultSearchProperties;
        if (defaultProperties) {
            this.state.manager.reset(false);
            for (const p of defaultProperties) {
                const operators = await this.state.manager.getOperations(p);
                this.state.manager.setValue(new ObjectPropertyValue(p, operators ? operators[0] : null, null));
            }
        }
    }

    public keyDown(event: any): void {
        if ((event.ctrlKey && event.key === 'Enter') && this.state.canSearch) {
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
        await SearchService.getInstance().provideResult(this.objectType, []);
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.INVALID;
        }

        this.state.resultCount = 0;
        this.state.limit = 500;

        SearchFormInstance.getInstance().reset();

        if (this.state.manager) {
            this.setDefaults();
        }

        this.state.table = await this.createTable();

        setTimeout(() => {
            this.state.prepared = true;
        }, 50);
    }

    public cancel(): void {
        const cache = SearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.VALID;
        }
        ContextService.getInstance().toggleActiveContext();
    }

    public async search(): Promise<void> {
        const validationResult = await this.state.manager.validate();
        if (validationResult && validationResult.some((r) => r.severity === ValidationSeverity.ERROR)) {
            this.showValidationError(validationResult.filter((r) => r.severity === ValidationSeverity.ERROR));
        } else {
            const hint = await TranslationService.translate('Translatable#Search');

            EventService.getInstance().publish(
                ApplicationEvent.TOGGLE_LOADING_SHIELD, new LoadingShieldEventData(true, hint)
            );

            const result = await SearchService.getInstance().executeSearch<KIXObject>(
                null, this.objectType, null
            ).catch((error: Error) => {
                BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
            });

            const currentColumns = this.state.table.getColumns();
            const removeColumnIds = currentColumns.filter(
                (c) => !this.state.table['columnConfiguration'].some((cc) => cc.property === c.getColumnId())
            ).map((c) => c.getColumnId());
            if (removeColumnIds.length) {
                this.state.table.removeColumns(removeColumnIds);
            }

            await this.setAdditionalColumns();

            EventService.getInstance().publish(
                ApplicationEvent.TOGGLE_LOADING_SHIELD,
                new LoadingShieldEventData(false)
            );

            setTimeout(() => {
                this.state.resultCount = Array.isArray(result) ? result.length : 0;
            }, 100);
        }
    }

    protected showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

    private async setAdditionalColumns(): Promise<void> {
        const searchCache = SearchService.getInstance().getSearchCache();
        const parameter: Array<[string, any]> = [];
        if (searchCache && searchCache.status === CacheState.VALID && searchCache.objectType === this.objectType) {
            for (const c of searchCache.criteria) {
                if (c.property !== SearchProperty.FULLTEXT && c.property !== TicketProperty.CLOSE_TIME &&
                    c.property !== TicketProperty.LAST_CHANGE_TIME) {
                    parameter.push([c.property, c.value]);
                }
            }
        }

        const searchDefinition = SearchService.getInstance().getSearchDefinition(this.objectType);
        const columns = await searchDefinition.getTableColumnConfiguration(parameter);
        await this.state.table.addColumns(columns);
    }

    public submit(): void {
        if (this.state.resultCount) {
            ContextService.getInstance().setActiveContext(SearchContext.CONTEXT_ID);
        }
    }

    public removeValue(): void {
        return;
    }

    private async setCanSearch(): Promise<void> {
        this.state.canSearch = SearchFormInstance.getInstance().getCriteria().some(
            (c) => c.property !== null && c.operator !== null
                && c.value !== null && c.value !== '' && !/^\s+$/.test(c.value.toString())
        );
    }

    public async searchCriteriaChanged(criteria: FilterCriteria[]): Promise<void> {
        await this.setCanSearch();
    }

    private async createTable(): Promise<Table> {
        const tableConfiguration = new TableConfiguration(null, null, null,
            this.objectType, null, null, null, [], false, false, null, null,
            TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            `search-form-results-${this.objectType}`, this.objectType, tableConfiguration,
            null, SearchContext.CONTEXT_ID, true, false, true, true, true
        );

        return table;
    }

    public limitChanged(event: any): void {
        const searchDefinition = SearchService.getInstance().getSearchDefinition(
            SearchFormInstance.getInstance().getObjectType()
        );
        this.state.limit = event.target.value;
        searchDefinition.setLimit(this.state.limit);
    }
}

module.exports = Component;
