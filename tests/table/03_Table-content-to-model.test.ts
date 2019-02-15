/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Table, ITable, ITableContentProvider, IRowObject, RowObject, ICell, DefaultColumnConfiguration, TableValue } from '../../src/core/browser/table';
import { KIXObjectType } from '../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Content Tests', () => {

    describe('Create a table instance with content provider.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
        });

        it('Should create a instance with a table provider.', () => {
            const tableContentProvider: ITableContentProvider = new TestTableContentProvider();
            table.setContentProvider(tableContentProvider);
            expect(table['contentProvider']).exist;
        });

    });

    describe('Content provider should deliver rows.', () => {
        let contentProvider: ITableContentProvider;

        before(() => {
            contentProvider = new TestTableContentProvider(3);
        });

        it('Should deliver content objects for the table.', async () => {
            const rowObjects: IRowObject[] = await contentProvider.loadData();
            expect(rowObjects).exist;
            expect(rowObjects).an('array');
            expect(rowObjects.length).equals(3);
        });
    });

    describe('Initialize table without content provider.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
        });

        it('table should contains rows', async () => {
            await table.initialize();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(0);
        });

    });

    describe('Initialize table with rows based on data given from content provider.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
        });

        it('Table should contain rows.', async () => {
            table.setContentProvider(new TestTableContentProvider(5, 2, true));
            await table.initialize();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(5);

            rows.forEach((r) => expect(r.getRowObject()).exist);
        });

        it('Should return an object type.', async () => {
            const objecType = table.getObjectType();
            expect(objecType).exist;
            expect(objecType).equal(KIXObjectType.ANY);
        });
    });

    describe('Initialize table with cells based on data given from content provider.', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(4, 10, true));
            await table.initialize();
        });

        it('Table should contain cells on each row.', async () => {
            const rows = table.getRows();
            rows.forEach((r) => {
                const cells = r.getCells();
                expect(cells).exist;
                expect(cells).an('array');
                expect(cells.length).equals(10);
                cells.forEach((c) => {
                    expect(c.getProperty()).exist;
                    expect(c.getValue()).exist;
                });
            });
        });

    });

    describe('Get a cell from a row', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(1, 2, true));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2')
            ])
            await table.initialize();
        });

        it('Should return the cell.', async () => {
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(1);

            const cell: ICell = rows[0].getCell('property-1');
            expect(cell).exist;
            expect(cell.getProperty()).equals('property-1');
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
            const values: TableValue[] = [];

            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`property-${c}`, `value-${r}-${c}`));
            }

            objects.push(new RowObject(values, this.withObject ? { KIXObjectType: KIXObjectType.ANY } : null));
        }
        return objects;
    }

}