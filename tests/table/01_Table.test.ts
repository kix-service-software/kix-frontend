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
import { Table } from '../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { RowObject } from '../../src/frontend-applications/agent-portal/modules/table/model/RowObject';
import { Row } from '../../src/frontend-applications/agent-portal/modules/table/model/Row';
import { Column } from '../../src/frontend-applications/agent-portal/modules/table/model/Column';
import { DefaultColumnConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/DefaultColumnConfiguration';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Tests', () => {

    describe('Create a new table instance.', () => {

        it('Should create a new table instance with given table id.', () => {
            const table: Table = new Table('test');
            expect(table).exist;
            expect(table.getTableId()).exist;
        });

    });

    describe('Create a new row with TableObject.', () => {
        let table: Table;

        before(() => {
            table = new Table('test');
        });

        it('Should create a row which contains the TableObject.', () => {
            const tableObject = new RowObject([]);
            const row = table.createRow(tableObject);
            expect(row).exist;
            expect(row.getRowObject()).exist;
        });

    });

    describe('Create new row in table.', () => {
        let table: Table;

        before(() => table = new Table('test'));

        it('Should create a new row in the table.', () => {
            const row: Row = table.createRow();
            expect(row).exist;
            expect(row.getRowId()).exist;
        });

    });

    describe('Get all table rows.', () => {
        let table: Table;
        let row1: Row, row2: Row, row3: Row;

        before(() => {
            table = new Table('test');
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
        let table: Table;
        let row: Row;

        before(() => {
            table = new Table('test');
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
        let table: Table;
        let row: Row;

        before(() => {
            table = new Table('test');
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
        let table: Table;

        before(() => {
            table = new Table('test');
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
        let table: Table;

        before(() => {
            table = new Table('test');
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
        let table: Table;

        before(() => {
            table = new Table('test');
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
        let table: Table;
        let oldRow1: Row;
        let oldRow2: Row;

        before(() => {
            table = new Table('test');
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
        let table: Table;
        let oldRow1: Row;
        let oldRow2: Row;
        let existingRow;

        before(() => {
            table = new Table('test');
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
        let table: Table;

        before(() => {
            table = new Table('test');
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
        let table: Table;

        before(() => {
            table = new Table('test');
        });

        it('Column configuration should have 4 entries.', () => {
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '2'),
                new DefaultColumnConfiguration(null, null, null, '3')
            ]);
            expect(table['columnConfigurations']).exist;
            expect(table['columnConfigurations']).is.an('array');
            expect(table['columnConfigurations'].length).equal(4);
        });
    });

    describe('Get columns.', () => {
        let table: Table;

        before(() => {
            table = new Table('test');
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '2'),
                new DefaultColumnConfiguration(null, null, null, '3')
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
        let table: Table;
        const columnId = '1';

        before(() => {
            table = new Table('test');
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'),
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '2')
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
        let table: Table;
        let columnId1 = '1';
        let columnId2 = '3';

        before(() => {
            table = new Table('test');
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'),
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '2'),
                new DefaultColumnConfiguration(null, null, null, '3'),
                new DefaultColumnConfiguration(null, null, null, '4')
            ]);
            table.initialize();
        });

        it('Should remove two columns.', () => {
            const removedColumns = table.removeColumns([columnId1, columnId2]) as Column[];
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
        let table: Table;

        beforeEach(() => {
            table = new Table('test');
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '1'),
                new DefaultColumnConfiguration(null, null, null, '2'),
                new DefaultColumnConfiguration(null, null, null, '3'),
            ]);
        });

        it('Should return a list with 0 columns (not initialized yet).', () => {

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns).is.empty;
        });

        it('Should return a list with 5 columns (addColumn before initialization).', async () => {
            const column1 = new DefaultColumnConfiguration(null, null, null, '4');
            const column2 = new DefaultColumnConfiguration(null, null, null, '5');

            await table.addAdditionalColumns([column1, column2]);
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
            const column1 = new DefaultColumnConfiguration(null, null, null, '4');
            const column2 = new DefaultColumnConfiguration(null, null, null, '5');

            await table.initialize();
            await table.addAdditionalColumns([column1, column2]);

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
        let table: Table;

        before(async () => {
            table = new Table('test');
            table.setColumnConfiguration([
                new DefaultColumnConfiguration(null, null, null, '0'),
                new DefaultColumnConfiguration(null, null, null, '1')
            ]);
            await table.initialize();
        });

        it('Should add the column only one time.', async () => {
            const column = new DefaultColumnConfiguration(null, null, null, '2');
            await table.addAdditionalColumns([column, column]);

            const columns = table.getColumns();
            expect(columns).exist;
            expect(columns).is.an('array');
            expect(columns.length).equals(3);

            expect(columns.some((c) => c.getColumnId() === column.property)).true;

            const addedColumns = columns.filter((c) => c.getColumnId() === column.property);
            expect(addedColumns.length).equals(1);
        });
    });

});
