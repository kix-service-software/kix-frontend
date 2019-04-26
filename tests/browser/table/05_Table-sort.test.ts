/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ITable, Table, IRowObject, ITableContentProvider, RowObject, DefaultColumnConfiguration, TableValue } from '../../../src/core/browser/table';
import { SortOrder, DataType, KIXObjectType } from '../../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Sort Tests', () => {

    describe('Sort table rows by column', () => {
        let table: ITable;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 10, false));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration('1', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration('2', true, true, false, false, 100, false, false, false, DataType.NUMBER)
            ]);
            await table.initialize();
        });

        it('Should sort rows by column down', async () => {
            await table.sort('1', SortOrder.DOWN);
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(50);

            const cells = rows.map((r) => r.getCell('1'));

            expect(cells[0].getValue().objectValue).equals(49);
            expect(cells[cells.length - 1].getValue().objectValue).equals(0);

            const sortOrder = table.getColumn('1').getSortOrder();
            expect(sortOrder).exist;
            expect(sortOrder).equals(SortOrder.DOWN);

            const childRows = rows[rows.length - 1].getChildren();
            expect(childRows.length).equals(10);

            const childCells = childRows.map((r) => r.getCell('1'));
            expect(childCells[0].getValue().objectValue, 'children not sorted correctly').equals(9);
            expect(childCells[childCells.length - 1].getValue().objectValue, 'children not sorted correctly').equals(0);

            const grantChildRows = childRows[childRows.length - 1].getChildren();
            expect(grantChildRows.length).equals(10);

            const grantChildCells = grantChildRows.map((r) => r.getCell('1'));
            expect(grantChildCells[0].getValue().objectValue, 'grantchildren not sorted correctly').equals(9);
            expect(grantChildCells[grantChildCells.length - 1].getValue().objectValue, 'grantchildren not sorted correctly').equals(0);
        });

        it('Should sort rows by column up', async () => {
            await table.sort('1', SortOrder.UP);
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(50);

            const cells = rows.map((r) => r.getCell('1'));

            expect(cells[0].getValue().objectValue).equals(0);
            expect(cells[cells.length - 1].getValue().objectValue).equals(49);

            const sortOrder = table.getColumn('1').getSortOrder();
            expect(sortOrder).exist;
            expect(sortOrder).equals(SortOrder.UP);

            const childRows = rows[0].getChildren();
            expect(childRows.length).equals(10);

            const childCells = childRows.map((r) => r.getCell('1'));
            expect(childCells[0].getValue().objectValue, 'children not sorted correctly').equals(0);
            expect(childCells[childCells.length - 1].getValue().objectValue, 'children not sorted correctly').equals(9);

            const grantChildRows = childRows[0].getChildren();
            expect(grantChildRows.length).equals(10);

            const grantChildCells = grantChildRows.map((r) => r.getCell('1'));
            expect(grantChildCells[0].getValue().objectValue, 'grantchildren not sorted correctly').equals(0);
            expect(grantChildCells[grantChildCells.length - 1].getValue().objectValue, 'grantchildren not sorted correctly').equals(9);
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
                values.push(new TableValue(`${c}`, r));
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
        const grantchildren: RowObject[] = [];
        for (let r = 0; r < 10; r++) {
            const values: TableValue[] = [];
            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, r));
            }
            grantchildren.push(new RowObject(values, this.withObject ? {} : null));
        }

        children[0]['children'] = grantchildren;
        rowObjects[0]['children'] = children;

        return rowObjects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
