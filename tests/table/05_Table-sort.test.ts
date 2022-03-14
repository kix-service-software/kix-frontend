/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { DataType } from '../../src/frontend-applications/agent-portal/model/DataType';
import { SortOrder } from '../../src/frontend-applications/agent-portal/model/SortOrder';
import { IEventSubscriber } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/EventService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Sort Tests', () => {

    describe('Sort table rows by column', () => {
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 10, false));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '1', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '2', true, true, false, false, 100, false, false, false, DataType.NUMBER)
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
    describe('Sort table on initialisation', () => {
        let table: Table;
        let subscriber: IEventSubscriber;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(50, 10, false, true));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '1', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '2', true, true, false, false, 100, false, false, false, DataType.NUMBER)
            ]);

            subscriber = {
                eventSubscriberId: 'sort-test-subscriber',
                eventPublished: (data: TableEventData, eventId: string, subscriberId?: string) => {
                    expect(data.tableId).equals(table.getTableId());
                    expect(eventId).equals(TableEvent.TABLE_INITIALIZED);

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
                }
            };
        });

        after(() => {
            EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, subscriber);
        });

        it('Should sort rows by column down', async () => {
            await table.sort('1', SortOrder.DOWN); // set sort settings (but do not sort --> table not initialized yet)
            EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, subscriber);
            table.initialize(); // do not wait for completion
            expect(table['initialized'], 'initialized state of table is true too late (KIX2018-2095)').is.true;
        });

    });

    describe('Sort table performance', () => {
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setContentProvider(new TestTableContentProvider(1500, 10, false));
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '1', true, true, false, false, 100, false, false, false, DataType.NUMBER),
                new DefaultColumnConfiguration(null, null, null, '2', true, true, false, false, 100, false, false, false, DataType.NUMBER)
            ]);
            await table.initialize();
        });

        it('Should sort 1500 rows below 1 second', async () => {
            const start = new Date().getTime();
            await table.sort('0', SortOrder.UP);
            const end = new Date().getTime();
            expect(end - start).below(1000);
        });

    });
});

class TestTableContentProvider extends TableContentProvider {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
        private withObject: boolean = false,
        private wait: boolean = false
    ) {
        super(null, null, null, null);
    }

    public initialize(): Promise<void> {
        return new Promise((resolve) => {
            if (this.wait) {
                setTimeout(() => {
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

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
                values.push(new TableValue(`${c}`, r, `${r}`));
            }
            children.push(new RowObject(values, this.withObject ? {} : null));
        }
        const grantchildren: RowObject[] = [];
        for (let r = 0; r < 10; r++) {
            const values: TableValue[] = [];
            for (let c = 0; c < this.cellCount; c++) {
                values.push(new TableValue(`${c}`, r, `${r}`));
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
