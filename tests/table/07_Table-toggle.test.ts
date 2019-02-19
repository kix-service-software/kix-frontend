/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ITable, Table, RowObject, IRowObject, ITableContentProvider, DefaultColumnConfiguration, TableValue } from '../../src/core/browser/table';
import { KIXObjectType } from '../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Toggle Tests', () => {
    let table: ITable;

    before(async () => {
        table = new Table();
        table.setContentProvider(new TestTableContentProvider(10, 3));
        table.setColumnConfiguration([
            new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
        ]);
    });

    describe('Toggle one row.', () => {
        beforeEach(async () => await table.initialize());

        it('Should return false on initnal state.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            expect(row.isExpanded()).is.false;
        });

        it('Should return true if row is expanded.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand(true);
            expect(row.isExpanded()).is.true;
        });

        it('Should return false if row is closed.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.expand();
            expect(row.isExpanded()).is.true;
            row.expand(false);
            expect(row.isExpanded()).is.false;
        });
    });
});

class TestTableContentProvider implements ITableContentProvider {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
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
                values.push(new TableValue(`${c}`, `value-${r}-${c}`));
            }

            objects.push(new RowObject(values));
        }
        return objects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
