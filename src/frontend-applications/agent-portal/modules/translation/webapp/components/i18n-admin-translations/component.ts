/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../core/TranslationService';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { TranslationPatternProperty } from '../../../model/TranslationPatternProperty';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { TranslationPattern } from '../../../model/TranslationPattern';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { SortOrder } from '../../../../../model/SortOrder';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableValue } from '../../../../table/model/TableValue';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';

class Component extends AbstractMarkoComponent<ComponentState, AdminContext> {

    public onCreate(input: any): void {
        super.onCreate(input, 'i18n-admin-translations');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            [
                'i18n-admin-translation-create',
                'i18n-admin-translation-import',
                'i18n-admin-translation-csv-export'
            ], this.state.table
        );
        this.context.widgetService.registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Translations']);

        this.state.filterValue = this.context.filterValue;
        this.search();

        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {
        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.TRANSLATION_PATTERN, null, [],
            null, false, null, false, false
        );

        this.state.table.setContentProvider(new TranslationPatternContentProvider(this.state, this.state.table));
        this.state.table.sort(TranslationPatternProperty.VALUE, SortOrder.UP);

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                if (data?.tableId === this.state.table?.getTableId()) {
                    this.context.widgetService.updateActions(this.state.instanceId);
                }

                if (eventId === ApplicationEvent.OBJECT_UPDATED || eventId === ApplicationEvent.OBJECT_CREATED) {
                    if (data.objectType === KIXObjectType.TRANSLATION_PATTERN) {
                        this.search();
                    }
                }
            },
            [
                TableEvent.ROW_SELECTION_CHANGED,
                ApplicationEvent.OBJECT_UPDATED,
                ApplicationEvent.OBJECT_CREATED
            ]
        );

        await this.state.table.initialize();
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public search(): void {
        this.context.setFilterValue(this.state.filterValue);
        this.state.table.reload(true);
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

}

// tslint:disable-next-line:max-classes-per-file
class TranslationPatternContentProvider extends TableContentProvider {

    public constructor(private state: ComponentState, table: Table) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, table, [], null);
    }

    public async loadData(): Promise<Array<RowObject<TranslationPattern>>> {
        const rowObjects = [];
        if (this.state.filterValue && this.state.filterValue !== '') {
            const filter = [
                new FilterCriteria(
                    TranslationPatternProperty.VALUE,
                    SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.AND, this.state.filterValue
                )
            ];

            const loadingOptions = new KIXObjectLoadingOptions(
                filter, null, 0, [TranslationPatternProperty.AVAILABLE_LANGUAGES]
            );

            const pattern = await KIXObjectService.loadObjects<TranslationPattern>(
                KIXObjectType.TRANSLATION_PATTERN, null, loadingOptions
            );

            for (const scd of pattern) {
                const rowObject = await this.createRowObject(scd);
                rowObjects.push(rowObject);
            }
        }

        this.state.title = await TranslationService.translate(
            'Translatable#Internationalisation: Translations ({0})', [rowObjects.length]
        );

        return rowObjects;
    }

    private async createRowObject(definition: TranslationPattern): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            const tableValue = new TableValue(column.property, definition[column.property]);
            values.push(tableValue);
        }

        const rowObject = new RowObject<TranslationPattern>(values, definition);

        return rowObject;
    }

}

module.exports = Component;
