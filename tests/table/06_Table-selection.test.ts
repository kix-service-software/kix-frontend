/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { KIXObject } from '../../src/frontend-applications/agent-portal/model/kix/KIXObject';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';
import { Table } from '../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { RowObject } from '../../src/frontend-applications/agent-portal/modules/table/model/RowObject';
import { TableValue } from '../../src/frontend-applications/agent-portal/modules/table/model/TableValue';
import { SelectionState } from '../../src/frontend-applications/agent-portal/modules/table/model/SelectionState';
import { TableContentProvider } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/TableContentProvider';


chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Selection Tests', () => {
    let table: Table;

    before(async () => {
        table = new Table('test');
        table.setContentProvider(new TestTableContentProvider(50, 3));
        table.setColumnConfiguration([
            new DefaultColumnConfiguration(null, null, null, '0'), new DefaultColumnConfiguration(null, null, null, '1'), new DefaultColumnConfiguration(null, null, null, '2')
        ]);
        await table.initialize();
    });

    describe('Select rows and get them.', () => {

        it('Should return no rows if no rows are selected (initial).', async () => {
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Select all rows - should return all rows.', async () => {
            table.selectAll();
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(50);
        });

        it('Deselect all rows - should return no rows.', async () => {
            table.selectAll();
            table.selectNone();
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Select some rows - should return 10 rows.', async () => {
            const rows = table.getRows().slice(10, 20);
            table.setRowSelection(rows.map((r) => r.getRowId()));
            const selectedRows = await table.getSelectedRows();
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(10);

            expect(selectedRows.some((r) => r.getRowId() === rows[0].getRowId())).is.true;
            expect(selectedRows.some((r) => r.getRowId() === rows[5].getRowId())).is.true;
        });

        it('Select some rows, also with not existing rows - should return 5 rows.', async () => {
            const rows = table.getRows().slice(10, 15);
            table.setRowSelection([...rows.map((r) => r.getRowId()), 'not-existing-1', 'not-existing-2']);
            const selectedRows = await table.getSelectedRows();
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(5);

            expect(selectedRows.some((r) => r.getRowId() === rows[0].getRowId())).is.true;
            expect(selectedRows.some((r) => r.getRowId() === 'not-existing-1')).is.false;
        });

        it('Select some rows (by object) - should return 10 rows.', async () => {
            const rows = [...table.getRows().slice(5, 10), ...table.getRows().slice(20, 25)];
            table.setRowSelectionByObject(rows.map((r) => r.getRowObject().getObject()));
            const selectedRows = await table.getSelectedRows();
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(10);

            expect(selectedRows.some((r) => r.getRowId() === rows[0].getRowId())).is.true;
            expect(selectedRows.some((r) => r.getRowId() === rows[5].getRowId())).is.true;
        });

        it('Check row selection state of table.', async () => {
            table.selectAll();
            expect(table.getRowSelectionState()).equal(SelectionState.ALL);
            table.selectNone();
            expect(table.getRowSelectionState()).equal(SelectionState.NONE);
            const rows = table.getRows().slice(10, 20);
            table.setRowSelection(rows.map((r) => r.getRowId()));
            expect(table.getRowSelectionState()).equal(SelectionState.INDETERMINATE);
        });
    });

    describe('Select rows and get them (with active filter).', () => {
        beforeEach(async () => {
            table.setFilter('value-1'); // value-1, value-10 ... value-19 (11)
            await table.filter();
        });

        it('Select all rows - should return all filtered rows.', async () => {
            table.selectAll();
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(11);
        });

        it('Select all rows - should return all rows (without filter).', async () => {
            table.selectAll(true);
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(11);
            const allRows = await table.getSelectedRows(true);
            expect(allRows).exist;
            expect(allRows).an('array');
            expect(allRows.length).equal(50);
        });

        it('Select some rows - should return 5 filtered rows and 10 rows without filter consideration.', async () => {
            const filteredRows = table.getRows().slice(6); // 5 from 11 filtered rows
            const rows = table.getRows(true).slice(35, 40);
            table.setRowSelection([
                ...filteredRows.map((r) => r.getRowId()),
                ...rows.map((r) => r.getRowId())
            ]);
            const selectedFilteredRows = await table.getSelectedRows();
            expect(selectedFilteredRows).exist;
            expect(selectedFilteredRows).an('array');
            expect(selectedFilteredRows.length).equal(5);
            const selectedRows = await table.getSelectedRows(true);
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(10);
        });

        it('Check row selection state of table.', async () => {
            table.selectAll();
            expect(table.getRowSelectionState()).equal(SelectionState.ALL);
            expect(table.getRowSelectionState(true)).equal(SelectionState.INDETERMINATE);
            table.selectAll(true);
            table.selectNone();
            expect(table.getRowSelectionState()).equal(SelectionState.NONE);
            expect(table.getRowSelectionState(true)).equal(SelectionState.INDETERMINATE);
            const rows = table.getRows(true).slice(10, 20);
            table.setRowSelection(rows.map((r) => r.getRowId()));
            expect(table.getRowSelectionState()).equal(SelectionState.INDETERMINATE);
        });
    });

    describe('Select single row.', () => {

        before(async () => {
            table.setContentProvider(new TestTableContentProvider(10, 3));
        });

        beforeEach(async () => {
            table['initialized'] = false;
            await table.initialize();
        });

        it('Should return false if row is not selected (initial).', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            expect(row.isSelected()).is.false;
        });

        it('Should return true if row is selected.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;

            const rows = table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
            expect(rows[0].getRowId()).equal(row.getRowId());
        });

        it('Should return true if row is selected (by object).', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.select(false);
            expect(row.isSelected()).is.false;
            table.selectRowByObject(row.getRowObject().getObject(), true);
            expect(row.isSelected()).is.true;

            const rows = table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
            expect(rows[0].getRowId()).equal(row.getRowId());
        });

        it('Should return false if row is deselected.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;
            row.select(false);
            expect(row.isSelected()).is.false;

            const rows = table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Should return false if row is deselected (by object).', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;
            table.selectRowByObject(row.getRowObject().getObject(), false);
            expect(row.isSelected()).is.false;

            const rows = table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Select state of row should be true if all rows are selected.', () => {
            table.selectAll(true);
            const rows = table.getSelectedRows(true);
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(10);

            expect(rows[0]).exist;
            expect(rows[0].isSelected()).is.true;
        });

        it('Select state of row should be false if all rows are deselected.', () => {
            table.selectAll(true);
            const allRows = table.getSelectedRows(true);
            table.selectNone(true);
            const rows = table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;

            expect(allRows[0]).exist;
            expect(allRows[0].isSelected()).is.false;
        });

        it('Select state of row should be true if selection is set by table.', () => {
            const rows = table.getRows();
            table.setRowSelection([rows[0].getRowId()]);
            const selectedRows = table.getSelectedRows();
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(1);

            expect(selectedRows[0].isSelected()).is.true;
        });

        it('Check row selection state of table.', () => {
            const row = table.getRows()[0];
            row.select();
            expect(table.getRowSelectionState(true)).equal(SelectionState.INDETERMINATE);
            row.select(false);
            expect(table.getRowSelectionState(true)).equal(SelectionState.NONE);
        });

        it('Should return true for selectable state of row (initial).', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            expect(row.isSelectable()).is.true;
        });

        it('Should return false if row is set not selectable.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
        });

        it('Should return false if row is set not selectable.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.selectable();
            expect(row.isSelectable()).is.true;
        });

        it('Row should not be selectable if row is set not selectable.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.select();
            expect(row.isSelected()).is.false;
        });

        it('Row should be not not selected anymore if row is set not selectable.', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            row.selectable(true);
            row.select();
            expect(row.isSelected()).is.true;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.selectable();
            expect(row.isSelected()).is.false;
        });

        it('Should return correct selectable state if row is set selectable (by object).', () => {
            const row = table.getRows()[0];
            expect(row).exist;
            expect(row.isSelectable()).is.true;

            table.setRowsSelectableByObject([row.getRowObject().getObject()], false);
            expect(row.isSelectable()).is.false;
            table.setRowsSelectableByObject([row.getRowObject().getObject()], true);
            expect(row.isSelectable()).is.true;
        });
    });
});

class TestTableContentProvider extends TableContentProvider<any> {

    public constructor(
        private rowCount = 1,
        private cellCount = 2,
    ) {
        super(KIXObjectType.ANY, null, null, null)
    }

    protected initialized: boolean;
    protected useCache: boolean;

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

            objects.push(new RowObject(
                values,
                new TestTableObject({
                    ObjectId: `object-id-${r}`
                } as any)
            ));
        }
        return objects;
    }

    public async destroy(): Promise<void> {
        //
    }

}

class TestTableObject extends KIXObject {

    public ObjectId: string | number;
    public KIXObjectType: KIXObjectType | string = KIXObjectType.ANY;

    public constructor(object?: KIXObject) {
        super(object);
        if (object) {
            this.ObjectId = object.ObjectId;
        }
    }

    public equals(object: any): boolean {
        return this.ObjectId === object.ObjectId;
    }
}
