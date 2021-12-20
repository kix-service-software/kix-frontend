/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TableEvent } from '../../src/frontend-applications/agent-portal/modules/table/model/TableEvent';
import { TableEventData } from '../../src/frontend-applications/agent-portal/modules/table/model/TableEventData';
import { TableContentProvider } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/TableContentProvider';
import { UIFilterCriterion } from '../../src/frontend-applications/agent-portal/model/UIFilterCriterion';
import { SearchOperator } from '../../src/frontend-applications/agent-portal/modules/search/model/SearchOperator';
import { IEventSubscriber } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/EventService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Filter Tests', () => {

    describe('Filter table rows by search value', () => {
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 10, false));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
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

    describe('Filter with UIFilterCriterion', () => {
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
            ]);
            await table.initialize();
        });

        it('Should return one filtered row.', async () => {
            const criteria = new UIFilterCriterion('2', SearchOperator.EQUALS, 'value-10-2');
            table.setFilter(null, [criteria]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return all rows.', async () => {
            const criteria = new UIFilterCriterion('2', SearchOperator.CONTAINS, 'value');
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
            const criteria1 = new UIFilterCriterion('1', SearchOperator.EQUALS, 'value-10-1');
            const criteria2 = new UIFilterCriterion('2', SearchOperator.EQUALS, 'value-10-2');
            table.setFilter(null, [criteria1, criteria2]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return rows for criteria combination.', async () => {
            const criteria1 = new UIFilterCriterion('0', SearchOperator.EQUALS, 'value-12-0');
            const criteria2 = new UIFilterCriterion('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria3 = new UIFilterCriterion('2', SearchOperator.EQUALS, 'value-12-2');
            table.setFilter(null, [criteria1, criteria2, criteria3]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
        });

        it('Should return no rows for criteria where no column exist.', async () => {
            const criteria1 = new UIFilterCriterion('0', SearchOperator.EQUALS, 'value-12-0');
            const criteria2 = new UIFilterCriterion('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria3 = new UIFilterCriterion('3', SearchOperator.EQUALS, 'value-12-3');
            table.setFilter(null, [criteria1, criteria2, criteria3]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Should not match a row for criteria combination.', async () => {
            const criteria1 = new UIFilterCriterion('1', SearchOperator.EQUALS, 'value-12-1');
            const criteria2 = new UIFilterCriterion('2', SearchOperator.EQUALS, 'value-13-2');
            table.setFilter(null, [criteria1, criteria2]);
            await table.filter();
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

    });

    describe('Column filter getValues().', () => {
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
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
            const row = table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null))

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
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));

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
        let table: Table;

        beforeEach(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
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
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            const column = table.getColumn('2');
            column.getColumnConfiguration().hasListFilter = true;
            await column.filter(['value-1-2', 'value-2-2']);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(5);
        });

        // FIXME: Solve test @Ricky Kaiser
        // it('should filter the rows for given text value in relevant column', async () => {
        //     table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
        //     table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'should-not-match'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
        //     table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'should-not-match'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
        //     const column = table.getColumn('2');
        //     await column.filter(null, 'value-1-2');

        //     const rows = table.getRows();
        //     expect(rows).exist;
        //     expect(rows).an('array');
        //     expect(rows.length).equals(2);
        // });

        it('should filter the rows for list value', async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-3'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-4'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            const column = table.getColumn('2');
            column.getColumnConfiguration().hasListFilter = true;
            await column.filter(['value-1-2', 'value-1-1'], null);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(2);
        });

        it("should reset the filter", async () => {
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-2', 'value-1-2'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-3'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            table.createRow(new RowObject([new TableValue('0', 'value-1-2', 'value-1-2'), new TableValue('1', 'value-1-2', 'value-1-2'), new TableValue('2', 'value-1-4'), new TableValue('3', 'value-1-2', 'value-1-2'), new TableValue('4', 'value-1-2', 'value-1-2')], null));
            const column = table.getColumn('2');
            column.getColumnConfiguration().hasListFilter = true;
            await column.filter(['value-1-2', 'value-1-1'], null);
            let rows = table.getRows();
            expect(rows.length).equals(2);

            await column.filter();
            rows = table.getRows();
            expect(rows.length).equals(53);
        });

    });

    describe('Event Test', () => {
        let table: Table;
        let subscriber: IEventSubscriber;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(5, 5));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
            ]);
            await table.initialize();

            subscriber = {
                eventSubscriberId: 'test-subscriber',
                eventPublished: (data: TableEventData, eventId: string, subscriberId?: string) => {
                    expect(data.tableId).equals(table.getTableId());
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
        const objects = [];
        for (let r = 0; r < this.rowCount; r++) {
            const values: TableValue[] = [];

            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, `value-${r}-${c}`, `value-${r}-${c}`));
            }

            objects.push(new RowObject(values, this.withObject ? {} : null));
        }
        return objects;
    }

    public async destroy(): Promise<void> {
        //
    }

}
