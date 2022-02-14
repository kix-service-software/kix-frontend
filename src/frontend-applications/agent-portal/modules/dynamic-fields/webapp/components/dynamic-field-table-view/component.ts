/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { IdService } from '../../../../../model/IdService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { DynamicField } from '../../../model/DynamicField';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState>{

    private dynamicField: DynamicField;
    private tableValues: Array<string[]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.table) {
            this.tableValues = input.table;
            this.dynamicField = input.dynamicField;
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.createTable();
    }

    private createTable(): void {
        const columns: string[] = this.dynamicField?.Config?.Columns;
        const translatable: boolean = this.dynamicField?.Config?.TranslatableColumn;

        if (Array.isArray(columns)) {
            const tableConfiguration = new TableConfiguration(null, null, null, KIXObjectType.ANY);
            tableConfiguration.tableColumns = columns.map((c) => {
                const column = new DefaultColumnConfiguration(
                    null, null, null, c, true, false, true, true, 200, false, false
                );
                column.titleTranslatable = translatable;
                column.defaultText = c;
                return column;
            });

            const table = new Table(IdService.generateDateBasedId('dynamic-field-table'), tableConfiguration);
            table.setContentProvider(new DFTableContentProvider(table, columns, this.tableValues));
            table.setColumnConfiguration(tableConfiguration.tableColumns);
            this.state.table = table;
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
class DFTableContentProvider extends TableContentProvider {

    public constructor(
        public table: Table,
        public columns: string[],
        public tableValues: Array<string[]>
    ) {
        super(KIXObjectType.ANY, table, [], null);
    }

    public async loadData(): Promise<Array<RowObject<string[]>>> {
        const rows: RowObject[] = [];

        for (const row of this.tableValues) {
            const values: TableValue[] = [];
            row.forEach((c, index) => values.push(new TableValue(this.columns[index], c, c)));
            rows.push(new RowObject(values, row));
        }

        return rows;
    }
}

module.exports = Component;
