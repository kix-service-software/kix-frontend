/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ITable, Table, IRowObject, ITableContentProvider, RowObject, DefaultColumnConfiguration, TableValue } from '../../src/core/browser/table';
import { SortOrder, DataType, KIXObjectType } from '../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Sort Tests', () => {

    describe('Sort table rows by column', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
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
        const objects = [];
        for (let r = 0; r < this.rowCount; r++) {
            const rowObject: TableValue[] = [];

            for (let c = 0; c < this.cellCount; c++) {
                rowObject.push(new TableValue(`${c}`, r));
            }

            objects.push(new RowObject(rowObject, this.withObject ? {} : null));
        }
        return objects;
    }

}
