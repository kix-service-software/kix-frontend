/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../core/TranslationService';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { TableFactoryService, Table, RowObject, TableValue, TableEvent } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { TranslationPatternProperty } from '../../../model/TranslationPatternProperty';
import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { TranslationPattern } from '../../../model/TranslationPattern';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextMode } from '../../../../../model/ContextMode';
import { EditTranslationDialogContext } from '../../core/admin/context';
import { SortOrder } from '../../../../../model/SortOrder';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            [
                'i18n-admin-translation-create',
                'i18n-admin-translation-import',
                'i18n-admin-translation-csv-export'
            ], this.state.table
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Translations']);

        const context = ContextService.getInstance().getActiveContext<AdminContext>();
        this.state.filterValue = context.filterValue;
        this.search();

        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {

        const tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.TRANSLATION_PATTERN,
            null, null, null, [], true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE,
            'Translatable#Please enter a search term.'
        );

        tableConfiguration.routingConfiguration = new RoutingConfiguration(
            EditTranslationDialogContext.CONTEXT_ID, KIXObjectType.TRANSLATION_PATTERN,
            ContextMode.EDIT_ADMIN, TranslationPatternProperty.ID
        );

        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.TRANSLATION_PATTERN, tableConfiguration, [],
            null, false, null, false, false
        );

        this.state.table.setContentProvider(new TranslationPatternContentProvider(this.state, this.state.table));
        this.state.table.sort(TranslationPatternProperty.VALUE, SortOrder.UP);

        this.subscriber = {
            eventSubscriberId: 'admin-translations',
            eventPublished: (data: any, eventId: string): void => {
                if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }

                if (eventId === ApplicationEvent.OBJECT_UPDATED || eventId === ApplicationEvent.OBJECT_CREATED) {
                    if (data.objectType === KIXObjectType.TRANSLATION_PATTERN) {
                        this.search();
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_CREATED, this.subscriber);

        await this.state.table.initialize();
    }

    public keyUp(event: any): void {
        this.state.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public search(): void {
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof AdminContext) {
            context.setFilterValue(this.state.filterValue);
            this.state.table.reload(true);
        }
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
                filter, null, null, [TranslationPatternProperty.AVAILABLE_LANGUAGES]
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
