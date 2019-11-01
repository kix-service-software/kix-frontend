/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Table, ITable, IColumnConfiguration, DefaultColumnConfiguration, ITableContentProvider, IRowObject, RowObject, TableValue } from '../../../src/core/browser/table';
import { KIXObjectType } from '../../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Column Configuration Tests', () => {

    describe('Create a table instance with column configuration.', () => {
        let table: ITable;

        before(() => {
            table = new Table('test')
            table.setContentProvider(new TestTableContentProvider(10, 2, false));
        });

        it('DefaultColumnConfguration should have right defaults.', async () => {
            const config = new DefaultColumnConfiguration(null, null, null,'1');
            expect(config.showIcon).is.true;
            expect(config.showText).is.true;
        });

        it('Should initialize a table with the correct amount of columns.', async () => {
            const columnConfiguration: IColumnConfiguration[] = [
                new DefaultColumnConfiguration(null, null, null,'A'), new DefaultColumnConfiguration(null, null, null,'B'), new DefaultColumnConfiguration(null, null, null,'C'),
                new DefaultColumnConfiguration(null, null, null,'D'), new DefaultColumnConfiguration(null, null, null,'E'), new DefaultColumnConfiguration(null, null, null,'F')
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
class TestTableContentProvider implements ITableContentProvider {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
        private withObject: boolean = false
    ) { }

    public async initialize(): Promise<void> { }

    public getObjectType(): KIXObjectType {
        return KIXObjectType.ANY;
    }

    public async loadData(): Promise<IRowObject[]> {
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
