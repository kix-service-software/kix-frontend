/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ITable, Table, RowObject, IRowObject, ITableContentProvider, DefaultColumnConfiguration, SelectionState, TableValue } from '../../src/core/browser/table';
import { KIXObjectType } from '../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Selection Tests', () => {
    let table: ITable;

    before(async () => {
        table = new Table();
        table.setContentProvider(new TestTableContentProvider(50, 3));
        table.setColumnConfiguration([
            new DefaultColumnConfiguration('0'), new DefaultColumnConfiguration('1'), new DefaultColumnConfiguration('2')
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

        it('Should return false if row is not selected (initial).', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            expect(row.isSelected()).is.false;
        });

        it('Should return true if row is selected.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;

            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(1);
            expect(rows[0].getRowId()).equal(row.getRowId());
        });

        it('Should return false if row is deselected.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;
            row.select(false);
            expect(row.isSelected()).is.false;

            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;
        });

        it('Select state of row should be true if all rows are selected.', async () => {
            table.selectAll();
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equal(10);

            expect(rows[0]).exist;
            expect(rows[0].isSelected()).is.true;
        });

        it('Select state of row should be false if all rows are deselected.', async () => {
            table.selectAll();
            const allRows = await table.getSelectedRows();
            table.selectNone();
            const rows = await table.getSelectedRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows).is.empty;

            expect(allRows[0]).exist;
            expect(allRows[0].isSelected()).is.false;
        });

        it('Select state of row should be true if selection is set by table.', async () => {
            const rows = table.getRows();
            table.setRowSelection([rows[0].getRowId()]);
            const selectedRows = await table.getSelectedRows();
            expect(selectedRows).exist;
            expect(selectedRows).an('array');
            expect(selectedRows.length).equal(1);

            expect(selectedRows[0].isSelected()).is.true;
        });

        it('Check row selection state of table.', async () => {
            const row = table.getRows()[0];
            row.select();
            expect(table.getRowSelectionState()).equal(SelectionState.INDETERMINATE);
            row.select(false);
            expect(table.getRowSelectionState()).equal(SelectionState.NONE);
        });

        it('Should return true for selectable state of row (initial).', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            expect(row.isSelectable()).is.true;
        });

        it('Should return false if row is set not selectable.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
        });

        it('Should return false if row is set not selectable.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.selectable();
            expect(row.isSelectable()).is.true;
        });

        it('Row should not be selectable if row is set not selectable.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.select();
            expect(row.isSelected()).is.false;
        });

        it('Row should be not not selected anymore if row is set not selectable.', async () => {
            const row = await table.getRows()[0];
            expect(row).exist;
            row.select();
            expect(row.isSelected()).is.true;
            row.selectable(false);
            expect(row.isSelectable()).is.false;
            row.selectable();
            expect(row.isSelected()).is.false;
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
