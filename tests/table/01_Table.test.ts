/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { ITable, Row, Column, Table, IRow, IColumn, RowObject, DefaultColumnConfiguration, TableConfiguration } from '../../src/core/browser/table';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Tests', () => {

    describe('Create a new table instance.', () => {

        it('Should create a new table instance with given table id.', () => {
            const table: ITable = new Table();
            expect(table).exist;
            expect(table.getTableId()).exist;
        });

    });

    describe('Create a new row with ITableObject.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
        });

        it('Should create a row which contains the ITableObject.', () => {
            const tableObject = new RowObject([]);
            const row = table.createRow(tableObject);
            expect(row).exist;
            expect(row.getRowObject()).exist;
        });

    });

    describe('Create new row in table.', () => {
        let table: ITable;

        before(() => table = new Table());

        it('Should create a new row in the table.', () => {
            const row: IRow = table.createRow();
            expect(row).exist;
            expect(row.getRowId()).exist;
        });

    });

    describe('Get all table rows.', () => {
        let table: ITable;
        let row1: IRow, row2: IRow, row3: IRow;

        before(() => {
            table = new Table();
            row1 = table.createRow();
            row2 = table.createRow();
            row3 = table.createRow();
        });

        it('Should return all rows.', () => {
            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(3);
            expect(rows[0]).is.instanceOf(Row);
            expect(rows[0].getRowId()).equals(row1.getRowId());
            expect(rows[1]).is.instanceOf(Row);
            expect(rows[1].getRowId()).equals(row2.getRowId());
            expect(rows[2]).is.instanceOf(Row);
            expect(rows[2].getRowId()).equals(row3.getRowId());
        });
    });

    describe('Get specific row.', () => {
        let table: ITable;
        let row: IRow;

        before(() => {
            table = new Table();
            table.createRow();
            row = table.createRow();
            table.createRow();
        })
        it('Should return requested row.', () => {
            const resultRow = table.getRow(row.getRowId());
            expect(resultRow).exist;
            expect(resultRow).is.instanceOf(Row);
            expect(resultRow.getRowId()).equals(resultRow.getRowId());
        });
    });

    describe('Remove a row from table.', () => {
        let table: ITable;
        let row: IRow;

        before(() => {
            table = new Table();
            table.createRow();
            row = table.createRow();
            table.createRow();
            table.createRow();
        });

        it('Should remove a row from the table.', () => {
            const removedRows = table.removeRows([row.getRowId()]);
            expect(removedRows).exist;
            expect(removedRows).is.an('array');
            expect(removedRows.length).equals(1);

            expect(removedRows.some((rr) => rr.getRowId() === row.getRowId())).true;

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(3);

            expect(rows.some((r) => r.getRowId() === row.getRowId())).false;
        });
    });

    describe('Add two rows at the end.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
            table.createRow();
            table.createRow();
            table.createRow();
            table.createRow();
        });

        it('Should return 12 rows.', () => {
            const row1 = new Row(table);
            const row2 = new Row(table);
            table.addRows([row1, row2]);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(6);

            expect(rows.some((r) => r.getRowId() === row1.getRowId())).true;
            expect(rows.some((r) => r.getRowId() === row2.getRowId())).true;

            const lastRow = rows[rows.length - 1];
            expect(lastRow.getRowId()).equals(row2.getRowId());
        });
    });

    describe('Add a row on position two.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
            table.createRow();
            table.createRow();
            table.createRow();
            table.createRow();
            table.createRow();
        });

        it('Should return the rows with the new row on position two.', () => {
            const row = new Row(table);
            table.addRows([row], 1);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(6);

            expect(rows[1].getRowId()).equals(row.getRowId());
        });
    });

    describe('Add one row twice.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
            table.createRow();
            table.createRow();
        });

        it('Should add only one row.', () => {
            const row = new Row(table);
            table.addRows([row, row]);

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(3);

            expect(rows.some((r) => r.getRowId() === row.getRowId())).true;
        });
    });

    describe('Replace two rows.', () => {
        let table: ITable;
        let oldRow1: IRow;
        let oldRow2: IRow;

        before(() => {
            table = new Table();
            oldRow1 = table.createRow();
            oldRow2 = table.createRow();;
        });

        it('Should return 10 rows.', () => {
            const row1 = new Row(table);
            const row2 = new Row(table);

            const replacedRows = table.replaceRows([
                [oldRow1.getRowId(), row1],
                [oldRow2.getRowId(), row2]
            ]);

            expect(replacedRows).exist;
            expect(replacedRows).an('array');
            expect(replacedRows.length).equals(2);

            expect(replacedRows.some((r) => r.getRowId() === oldRow1.getRowId())).true;
            expect(replacedRows.some((r) => r.getRowId() === oldRow2.getRowId())).true;

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).an('array');
            expect(rows.length).equals(2);

            expect(rows.some((r) => r.getRowId() === oldRow1.getRowId())).false;
            expect(rows.some((r) => r.getRowId() === oldRow2.getRowId())).false;

            expect(rows.some((r) => r.getRowId() === row1.getRowId())).true;
            expect(rows.some((r) => r.getRowId() === row2.getRowId())).true;
        });
    });

    describe('Replace two rows but one with already exiting row.', () => {
        let table: ITable;
        let oldRow1: IRow;
        let oldRow2: IRow;
        let existingRow;

        before(() => {
            table = new Table();
            oldRow1 = table.createRow();
            oldRow2 = table.createRow();
            existingRow = table.createRow();
        });
        it('Should replace the rows and add one new row', () => {
            const newRow = new Row(table);
            const replacedRows = table.replaceRows([
                [oldRow1.getRowId(), existingRow],
                [oldRow2.getRowId(), newRow]
            ]);

            expect(replacedRows).exist;
            expect(replacedRows).an('array');
            expect(replacedRows.length).equals(2);

            expect(replacedRows.some((r) => r.getRowId() === oldRow1.getRowId())).true;
            expect(replacedRows.some((r) => r.getRowId() === oldRow2.getRowId())).true;

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(2);

            expect(rows.some((r) => r.getRowId() === oldRow1.getRowId())).false;
            expect(rows.some((r) => r.getRowId() === oldRow2.getRowId())).false;

            expect(rows.some((r) => r.getRowId() === newRow.getRowId())).true;
            expect(rows.some((r) => r.getRowId() === existingRow.getRowId())).true;
        });
    });

    describe('Replace not exiting row.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
            table.createRow();
        });

        it('Should return unmodified rows (no replace should be done).', () => {
            const newRow = new Row(table);
            const notExistingRowId = 'does-not-exists';
            const replacedRows = table.replaceRows([
                [notExistingRowId, newRow]
            ]);
            expect(replacedRows).exist;
            expect(replacedRows).is.an('array');
            expect(replacedRows).is.empty;

            const rows = table.getRows();
            expect(rows).exist;
            expect(rows).is.an('array');
            expect(rows.length).equals(1);

            expect(rows.some((r) => r.getRowId() === notExistingRowId)).false;
            expect(rows.some((r) => r.getRowId() === newRow.getRowId())).false;
        });
    });

    describe('Set column configuration.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
        });

        it('Column configuration should have 4 entries.', () => {
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3')
            ]);
            expect(table['columnConfiguration']).exist;
            expect(table['columnConfiguration']).is.an('array');
            expect(table['columnConfiguration'].length).equal(4);
        });
    });

    describe('Get columns.', () => {
        let table: ITable;

        before(() => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3')
            ])
        });

        it('Should return no columns (not initialized yet).', () => {
            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns).is.empty;
        });

        it('Should return all columns.', async () => {
            await table.initialize();
            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(4);
            expect(columns[0]).is.instanceOf(Column);
        });
    });

    describe('Get specific column.', () => {
        let table: ITable;
        const columnId = '1';

        before(() => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2')
            ]);
            table.initialize();
        });

        it('Should return requested column.', () => {
            const result = table.getColumn(columnId);
            expect(result).exist;
            expect(result).is.instanceOf(Column);
            expect(result.getColumnId()).equals(columnId);
        });
    });

    describe('Remove two columns.', () => {
        let table: ITable;
        let columnId1 = '1';
        let columnId2 = '3';

        before(() => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3'),
                new DefaultColumnConfiguration('4')
            ]);
            table.initialize();
        });

        it('Should remove two columns.', () => {
            const removedColumns = table.removeColumns([columnId1, columnId2]);
            expect(removedColumns).exist;
            expect(removedColumns).is.an('array');
            expect(removedColumns.length).equals(2);

            expect(removedColumns.some((c) => c.getColumnId() === columnId1)).true;
            expect(removedColumns.some((c) => c.getColumnId() === columnId2)).true;

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(3);

            expect(columns.some((c) => c.getColumnId() === columnId1), 'removeColumns removes wrong column').is.false;
            expect(columns.some((c) => c.getColumnId() === columnId2), 'removeColumns removes wrong column').is.false;
        });
    });

    describe('Add two columns.', () => {
        let table: ITable;

        beforeEach(() => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3'),
            ]);
        });

        it('Should return a list with 0 columns (not initialized yet).', () => {

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns).is.empty;
        });

        it('Should return a list with 5 columns (addColumn before initialization).', async () => {
            const column1 = new DefaultColumnConfiguration('4');
            const column2 = new DefaultColumnConfiguration('5');

            table.addColumns([column1, column2]);
            await table.initialize();

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(5);

            expect(columns.some((c) => c.getColumnId() === column1.property)).is.true;
            expect(columns.some((c) => c.getColumnId() === column2.property)).is.true;

            expect(columns[columns.length - 1].getColumnId()).equals(column2.property);
        });

        it('Should return a list with 5 columns (addColumn after initialization).', async () => {
            const column1 = new DefaultColumnConfiguration('4');
            const column2 = new DefaultColumnConfiguration('5');

            await table.initialize();
            table.addColumns([column1, column2]);

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(5);

            expect(columns.some((c) => c.getColumnId() === column1.property)).is.true;
            expect(columns.some((c) => c.getColumnId() === column2.property)).is.true;

            expect(columns[columns.length - 1].getColumnId()).equals(column2.property);
        });
    });

    describe('Add one column twice.', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1')
            ]);
            await table.initialize();
        });

        it('Should add the column only one time.', () => {
            const column = new DefaultColumnConfiguration('2');
            table.addColumns([column, column]);

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(3);

            expect(columns.some((c) => c.getColumnId() === column.property)).true;

            const addedColumns = columns.filter((c) => c.getColumnId() === column.property);
            expect(addedColumns.length).equals(1);
        });
    });

    describe('Replace two columns.', () => {
        let table: ITable;
        let columnId1 = '1';
        let columnId2 = '2';

        before(async () => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3'),
            ]);
            await table.initialize();
        });

        it('Should return a list of columns without the replaced columns.', () => {
            const newColumn1 = new Column(table, new DefaultColumnConfiguration('4'));
            const newColumn2 = new Column(table, new DefaultColumnConfiguration('5'));
            const replacedColumns = table.replaceColumns([
                [columnId1, newColumn1],
                [columnId2, newColumn2]
            ]);

            expect(replacedColumns).exist;
            expect(replacedColumns).is.an('array');
            expect(replacedColumns.length).equals(2);

            expect(replacedColumns.some((r) => r.getColumnId() === columnId1)).true;
            expect(replacedColumns.some((r) => r.getColumnId() === columnId2)).true;

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(4);

            expect(columns.some((c) => c.getColumnId() === columnId1)).false;
            expect(columns.some((c) => c.getColumnId() === columnId2)).false;

            expect(columns.some((c) => c.getColumnId() === newColumn1.getColumnId())).true;
            expect(columns.some((c) => c.getColumnId() === newColumn2.getColumnId())).true;
        });
    });

    describe('Replace two columns but one with already exiting column.', () => {
        let table: ITable;
        let columnId1 = '0';
        let columnId2 = '1';

        before(async () => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1'),
                new DefaultColumnConfiguration('2'),
                new DefaultColumnConfiguration('3'),
            ]);
            await table.initialize();
        });
        it('Should return columns (replace with existing column should remove exiting column and replace old with new column).', () => {
            const newColumn = new Column(table, new DefaultColumnConfiguration('4'));
            const existingColumn = table.getColumn('2');
            const replacedColumns = table.replaceColumns([
                [columnId1, newColumn],
                [columnId2, existingColumn]
            ]);

            expect(replacedColumns).exist;
            expect(replacedColumns).is.an('array');
            expect(replacedColumns.length).equals(2);

            expect(replacedColumns.some((r) => r.getColumnId() === columnId1)).true;
            expect(replacedColumns.some((r) => r.getColumnId() === columnId2)).true;

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(3);

            expect(columns.some((c) => c.getColumnId() === columnId1)).false;
            expect(columns.some((c) => c.getColumnId() === columnId2)).false;

            expect(columns.some((c) => c.getColumnId() === newColumn.getColumnId())).true;
            expect(columns.some((c) => c.getColumnId() === existingColumn.getColumnId())).true;
        });
    });

    describe('Replace not exiting column.', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1')
            ]);
            await table.initialize();
        });

        it('No replace should be done.', () => {
            const newColumn = new Column(table, new DefaultColumnConfiguration('2'));
            const notExistingColumnId = 'does-not-exists';
            const replacedColumns = table.replaceColumns([
                [notExistingColumnId, newColumn]
            ]);

            expect(replacedColumns).exist;
            expect(replacedColumns).is.an('array');
            expect(replacedColumns).is.empty;

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(2);

            expect(columns.some((c) => c.getColumnId() === notExistingColumnId)).false;
            expect(columns.some((c) => c.getColumnId() === newColumn.getColumnId())).false;
        });
    });

    describe('Replace not exiting column with column which already exist.', () => {
        let table: ITable;

        before(async () => {
            table = new Table();
            table.setColumnConfiguration([
                new DefaultColumnConfiguration('0'),
                new DefaultColumnConfiguration('1')
            ]);
            await table.initialize();
        });

        it('No replace should be done and existing column should not be deleted.', () => {
            const notExistingColumnId = 'does-not-exists';
            const existingColumn = table.getColumn('1');
            const replacedColumns = table.replaceColumns([
                [notExistingColumnId, existingColumn]
            ]);

            expect(replacedColumns).exist;
            expect(replacedColumns).is.an('array');
            expect(replacedColumns).is.empty;

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(2);

            expect(columns.some((c) => c.getColumnId() === notExistingColumnId)).is.false;
            expect(columns.some((c) => c.getColumnId() === existingColumn.getColumnId())).true;
        });
    });

});
