/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Table } from '../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { RowObject } from '../../src/frontend-applications/agent-portal/modules/table/model/RowObject';
import { TableValue } from '../../src/frontend-applications/agent-portal/modules/table/model/TableValue';
import { TableContentProvider } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/TableContentProvider';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';
import { IColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/IColumnConfiguration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Column Configuration Tests', () => {

    describe('Create a table instance with column configuration.', () => {
        let table: Table;

        before(() => {
            table = new Table('test')
            table.setContentProvider(new TestTableContentProvider(10, 2, false));
        });

        it('DefaultColumnConfguration should have right defaults.', async () => {
            const config = new DefaultColumnConfiguration(null, null, null, '1');
            expect(config.showIcon).is.true;
            expect(config.showText).is.true;
        });

        it('Should initialize a table with the correct amount of columns.', async () => {
            const columnConfiguration: IColumnConfiguration[] = [
                new DefaultColumnConfiguration(null, null, null, 'A'), new DefaultColumnConfiguration(null, null, null, 'B'), new DefaultColumnConfiguration(null, null, null, 'C'),
                new DefaultColumnConfiguration(null, null, null, 'D'), new DefaultColumnConfiguration(null, null, null, 'E'), new DefaultColumnConfiguration(null, null, null, 'F')
            ];

            table.setColumnConfiguration(columnConfiguration);
            await table.initialize();

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).an('array');
            expect(columns.length).equals(6);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows[0].getCells().length, 'rows have wrong number of cells').equals(8);
            const childRows = rows[0].getChildren();
            expect(childRows).exist;
            expect(childRows).an('array');
            expect(childRows[0].getCells().length, 'child rows have wrong number of cells').equals(8);
        });
    });
});
class TestTableContentProvider extends TableContentProvider {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
        private withObject: boolean = false
    ) {
        super(null, null, null, null);
    }

    public async initialize(): Promise<void> { }

    public getObjectType(): KIXObjectType | string {
        return KIXObjectType.ANY;
    }

    public async loadData(): Promise<RowObject[]> {
        const rowObjects: RowObject[] = [];
        for (let r = 0; r < this.rowCount; r++) {
            const values: TableValue[] = [];

            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, r, `${r}`));
            }

            rowObjects.push(new RowObject(values, this.withObject ? {} : null));
        }

        const children: RowObject[] = [];
        for (let r = 0; r < 10; r++) {
            const values: TableValue[] = [];
            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, r));
            }
            children.push(new RowObject(values, this.withObject ? {} : null));
        }

        rowObjects[0]['children'] = children;

        return rowObjects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
