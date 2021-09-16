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
import { SysConfigOptionDefinitionProperty } from '../../../model/SysConfigOptionDefinitionProperty';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { RowObject, TableValue, TableFactoryService, TableEvent, TableEventData } from '../../../../base-components/webapp/core/table';
import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { SysConfigOptionDefinition } from '../../../model/SysConfigOptionDefinition';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { SysconfigEvent } from '../../core/SysconfigEvent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { SysConfigOption } from '../../../model/SysConfigOption';
import { SysConfigOptionType } from '../../../model/SysConfigOptionType';
import { SysConfigOptionProperty } from '../../../model/SysConfigOptionProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { ContextType } from '../../../../../model/ContextType';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { EditSysConfigDialogContext } from '../../core';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    public filterValue: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            ['sysconfig-edit-action', 'sysconfig-reset-action', 'activate-configuration'], this.state.table
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#SysConfig']);

        const context = ContextService.getInstance().getActiveContext<AdminContext>();
        this.filterValue = context.filterValue;
        this.search();

        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {

        const tableConfiguration = new TableConfiguration(
            null, null, null,
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, null, null, null, true, false,
            null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, tableConfiguration, [],
            null, null, null, false, false
        );

        tableConfiguration.routingConfiguration = new RoutingConfiguration(
            EditSysConfigDialogContext.CONTEXT_ID, null, null, SysConfigOptionDefinitionProperty.NAME
        );

        this.state.table.setContentProvider(new SysConfigContentProvider(this));
        this.state.table.sort(SysConfigOptionProperty.NAME, SortOrder.UP);

        this.subscriber = {
            eventSubscriberId: 'admin-sysconfig',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }

                if (eventId === SysconfigEvent.SYSCONFIG_OPTIONS_UPDATED) {
                    this.search();
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(SysconfigEvent.SYSCONFIG_OPTIONS_UPDATED, this.subscriber);

        await this.state.table.initialize();
    }

    public keyUp(event: any): void {
        this.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public search(): void {
        this.state.filterValue = this.filterValue;

        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof AdminContext) {
            context.setFilterValue(this.filterValue);
        }

        this.state.table.reload(true);

    }
}

// tslint:disable-next-line:max-classes-per-file
class SysConfigContentProvider extends TableContentProvider {

    public constructor(private component: Component) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, component.state.table, [], null);
    }

    public async loadData(): Promise<Array<RowObject<SysConfigOptionDefinition>>> {
        const rowObjects = [];
        if (this.component.filterValue && this.component.filterValue !== '') {
            let filter = [
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.NAME,
                    SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, this.component.filterValue
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.CONTEXT,
                    SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, this.component.filterValue
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.CONTEXT_METADATA,
                    SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, this.component.filterValue
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.GROUP,
                    SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, this.component.filterValue
                )
            ];

            if (this.component.filterValue === 'modified' || this.component.filterValue === '!modified') {
                const modified = this.component.filterValue === 'modified' ? 1 : 0;
                filter = [
                    new FilterCriteria(
                        SysConfigOptionDefinitionProperty.IS_MODIFIED,
                        SearchOperator.EQUALS,
                        FilterDataType.NUMERIC, FilterType.AND, modified
                    )
                ];
            }

            const loadingOptions = new KIXObjectLoadingOptions(filter);

            const definitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, loadingOptions
            );

            const options = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, definitions.map((d) => d.Name)
            );

            for (const scd of definitions) {
                const option = options.find((o) => o.Name === scd.Name);
                const rowObject = await this.createRowObject(scd, option);
                rowObjects.push(rowObject);
            }
        }

        this.component.state.title = await TranslationService.translate(
            'Translatable#System: Sysconfig ({0})', [rowObjects.length]
        );

        return rowObjects;
    }

    private async createRowObject(definition: SysConfigOptionDefinition, option: SysConfigOption): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            let tableValue: TableValue;
            if (column.property === SysConfigOptionDefinitionProperty.VALUE) {

                // if no option or value is null and option is invalid, uses values from definition
                // (check if null-value and invalid comes first, because value could be from config-file)
                let value = !option || (option.Value === null && definition.ValidID !== 1)
                    ? !definition.IsModified || definition.Value === null || definition.Value === '' // 0 is valid
                        ? definition.Default : definition.Value
                    : option.Value;

                if (
                    value !== '' &&
                    (
                        definition.Type === SysConfigOptionType.HASH
                        || definition.Type === SysConfigOptionType.ARRAY
                        || definition.Type === SysConfigOptionType.OBJECT
                    )
                ) {
                    value = JSON.stringify(value);
                }
                tableValue = new TableValue(column.property, value, value);
            } else if (column.property === SysConfigOptionDefinitionProperty.NAME) {
                const icons = option && option.ReadOnly ? ['kix-icon-lock-close'] : [];
                tableValue = new TableValue(column.property, definition[column.property]);
                tableValue.displayIcons = icons;
            } else {
                tableValue = new TableValue(column.property, definition[column.property]);
            }
            values.push(tableValue);
        }

        const rowObject = new RowObject<SysConfigOptionDefinition>(values, definition);

        return rowObject;
    }

}

module.exports = Component;
