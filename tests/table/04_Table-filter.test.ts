/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { TableFilterCriteria, KIXObjectType } from '../../src/core/model';
import { SearchOperator, TableValue } from '../../src/core/browser';
import { ITable, Table, RowObject, IRowObject, ITableContentProvider, DefaultColumnConfiguration, TableEvent } from '../../src/core/browser/table';
import { EventService, IEventSubscriber } from '../../src/core/browser/event';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Filter Tests', () => {

    describe('Filter table rows by search value', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(50, 10, false));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
            ]);
            await table.initialize();
        });

        it('Should return 11 rows where value 1 matches rows.', async () => {
            table.setFilter('value-1')
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(11);
        });

        it('Should return one rows.', async () => {
            table.setFilter('value-10');
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return all rows if value match every cell.', async () => {
            table.setFilter('value');
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Should return all rows if filter value is undefined.', async () => {
            table.setFilter(null);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Should return all rows if filter value is empty.', async () => {
            table.setFilter('');
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Should return no rows for criteria where no column exist.', async () => {
            table.setFilter('value-10-3');
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Should return no rows for criteria where no column exist.', async () => {
            table.setFilter('value-10-5');
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

    });

    describe('Filter with TableFilterCriteria', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
            ]);
            await table.initialize();
        });

        it('Should return one filtered row.', async () => {
            const criteria = new TableFilterCriteria('2', SearchOperator.EQUALS, 'value-10-2');
            table.setFilter(null, [criteria]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return all rows.', async () => {
            const criteria = new TableFilterCriteria('2', SearchOperator.CONTAINS, 'value');
            table.setFilter(null, [criteria]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Should return all rows if no filter is given.', async () => {
            table.setFilter(null, null);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Should return rows for criteria combination.', async () => {
            const criteria1 = new TableFilterCriteria('1', SearchOperator.EQUALS, 'value-10-1');
            const criteria2 = new TableFilterCriteria('2', SearchOperator.EQUALS, 'value-10-2');
            table.setFilter(null, [criteria1, criteria2]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return rows for criteria combination.', async () => {
            const criteria1 = new TableFilterCriteria('0', SearchOperator.EQUALS, 'value-12-0');
            const criteria2 = new TableFilterCriteria('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria3 = new TableFilterCriteria('2', SearchOperator.EQUALS, 'value-12-2');
            table.setFilter(null, [criteria1, criteria2, criteria3]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return no rows for criteria where no column exist.', async () => {
            const criteria1 = new TableFilterCriteria('0', SearchOperator.EQUALS, 'value-12-0');
            const criteria2 = new TableFilterCriteria('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria3 = new TableFilterCriteria('3', SearchOperator.EQUALS, 'value-12-3');
            table.setFilter(null, [criteria1, criteria2, criteria3]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Should not match a row for criteria combination.', async () => {
            const criteria1 = new TableFilterCriteria('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria2 = new TableFilterCriteria('2', SearchOperator.EQUALS, 'value-13-2');
            table.setFilter(null, [criteria1, criteria2]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

    });

    describe('Column filter getValues().', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
            ]);
            await table.initialize();
        });

        it('Should return a list of values from column', () => {
            const column = table.getColumn('2');
            const values: Array<[any, number]> = column.getFilterValues();

            expect(values).exist;
            expect(values).an('array');
            expect(values.length).equals(50);
            expect(values.some((v) => v[0] === 'value-1-2'));
            expect(values.some((v) => v[0] === 'value-2-2'));
            expect(values.some((v) => v[0] === 'value-10-2'));
            expect(values.some((v) => v[0] === 'value-20-2'));
        });

        it('should not return duplicate values', async () => {
            const row = table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null))

            const column = table.getColumn('2');
            const values: Array<[any, number]> = column.getFilterValues();
            expect(values).exist;
            expect(values).an('array');
            expect(values.length).equals(50);
            expect(values.some((v) => v[0] === 'value-1-2'));
            expect(values.filter((v) => v[0] === 'value-1-2').length).equals(1);

            table.removeRows([row.getRowId()])
        });

        it('should count duplicate values', async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));

            const column = table.getColumn('2');
            const values: Array<[any, number]> = column.getFilterValues();
            expect(values).exist;
            expect(values).an('array');
            expect(values.length).equals(50);
            expect(values.some((v) => v[0] === 'value-1-2'));
            expect(values.filter((v) => v[0] === 'value-1-2').length).equals(1);

            const multiValue = values.find((v) => v[0] === 'value-1-2');
            expect(multiValue[1]).equals(4);
        });

    });

    describe('Set Column filter', () => {
        let table: ITable;

        beforeEach(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
            ]);
            await table.initialize();
        });

        it('should set the filter from column to table', async () => {
            const column = table.getColumn('2');
            await column.filter(['value-1-2']);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(1);
        });

        it('should filter the rows for given value', async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            const column = table.getColumn('2');
            await column.filter(['value-1-2', 'value-2-2']);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(5);
        });

        it('should filter the rows for given text value', async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            const column = table.getColumn('2');
            await column.filter(null, 'value-1-2');

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(4);
        });

        it('should filter the rows for list value', async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-3'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-4'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            const column = table.getColumn('2');
            await column.filter(['value-1-2', 'value-1-1'], null);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(2);
        });

        it("should reset the filter", async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-2'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-3'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2'), new TableValue('1', 'value-1-2'), new TableValue('2', 'value-1-4'), new TableValue('3', 'value-1-2'), new TableValue('4', 'value-1-2')], null));
            const column = table.getColumn('2');
            await column.filter(['value-1-2', 'value-1-1'], null);
            let rows = table.getRows();
            expect(rows.length).equals(2);

            await column.filter();
            rows = table.getRows();
            expect(rows.length).equals(53);
        });

    });

    describe('Event Test', () => {
        let table: ITable;
        let subscriber: IEventSubscriber;

        before(async () => {
            table = new Table();
            table.setContentProvider(new TestTableContentProvider(5, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
            ]);
            await table.initialize();

            subscriber = {
                eventSubscriberId: 'test-subscriber',
                eventPublished: (data: any, eventId: string, subscriberId?: string) => {
                    expect(data).equals(table.getTableId());
                    expect(eventId).equals(TableEvent.REFRESH);
                }
            };
        });

        after(() => {
            EventService.getInstance().unsubscribe(TableEvent.REFRESH, subscriber);
        });

        it('should publish REFRESH event after filter', async () => {
            EventService.getInstance().subscribe(TableEvent.REFRESH, subscriber);
            const column = table.getColumn('2');
            await column.filter(null, '');
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
                values.push(new TableValue(`${c}`, `value-${r}-${c}`));
            }

            objects.push(new RowObject(values, this.withObject ? {} : null));
        }
        return objects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
