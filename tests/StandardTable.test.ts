/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import {
    StandardTable, TableRowHeight, AbstractTableLayer, ITableFilterLayer, ITableSortLayer,
    ITableToggleLayer, TableRow, TableColumnConfiguration, ITableSelectionListener, ITableClickListener,
    ITableConfigurationListener, TableColumn, ToggleOptions, TableValue, ITablePreventSelectionLayer,
    ITableHighlightLayer, TableHeaderHeight, TableLayerConfiguration, TableListenerConfiguration, TableConfiguration, ITableToggleListener
} from '../src/core/browser/standard-table';
import { KIXObject, SortOrder, DataType, KIXObjectType } from '../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / StandardTable', () => {

    it('Table instance is correctly created.', () => {
        const table = createTable();
        expect(table).exist;
    });

    describe('Create table based on configuration.', () => {

        it('Table should have columns with correct properties.', async () => {
            const table = createTable();
            const columns = await table.getColumns();
            expect(columns).exist;
            expect(columns).an('array');
            expect(columns.length).equals(3);

            expect(columns[0].id).equals('id');
            expect(columns[1].id).equals('name');
            expect(columns[2].id).equals('value');

            expect(columns[0].dataType).equals(DataType.STRING);
            expect(columns[1].dataType).equals(DataType.STRING);
            expect(columns[2].dataType).equals(DataType.STRING);

            expect(columns[0].resizable).equals(true);
            expect(columns[1].resizable).equals(true);
            expect(columns[2].resizable).equals(true);

            expect(columns[0].sortable).equals(true);
            expect(columns[1].sortable).equals(true);
            expect(columns[2].sortable).equals(true);

            expect(columns[0].size).equals(100);
            expect(columns[1].size).equals(100);
            expect(columns[2].size).equals(100);

            expect(columns[0].showIcon).equals(false);
            expect(columns[1].showIcon).equals(false);
            expect(columns[2].showIcon).equals(false);

            expect(columns[0].showText).equals(true);
            expect(columns[1].showText).equals(true);
            expect(columns[2].showText).equals(true);
        });

        it('Should have correct rows (limit)', async () => {
            const table = createTable();
            await table.loadRows();

            const allRows = table.getTableRows(true);
            expect(allRows).exist;
            expect(allRows).an('array');
            expect(allRows.length).equals(1000);
        });

    });

    describe('Prevent selection.', () => {
        it('Should set some rows not selectable.', async () => {
            const table = createTable();

            const testObjects = [];
            for (let i = 0; i < 10; i++) {
                testObjects.push(new TestObject('test-object-' + i, 'TestObject' + i, 'TestObject' + i));
            }
            table.layerConfiguration.preventSelectionLayer.setPreventSelectionFilter(testObjects);

            await table.loadRows();
            const rows = table.getTableRows(true);
            expect(rows).exist;
            expect(rows).an('array');

            rows.forEach((r) => {
                if (testObjects.some((to) => to.equals(r.object))) {
                    expect(r.selectable).is.false;
                } else {
                    expect(r.selectable).is.true;
                }
            });
        });
    });

    describe('Highlight selection.', () => {
        it('Should set highlight css class for some rows.', async () => {
            const table = createTable();

            const testObjects = [];
            for (let i = 0; i < 10; i++) {
                testObjects.push(new TestObject('test-object-' + i, 'TestObject' + i, 'TestObject' + i));
            }
            table.layerConfiguration.highlightLayer.setHighlightedObjects(testObjects);

            await table.loadRows();
            const rows = table.getTableRows(true);
            expect(rows).exist;
            expect(rows).an('array');

            rows.forEach((r) => {
                if (testObjects.some((to) => to.equals(r.object))) {
                    expect(r.classes).includes('row-highlighted');
                } else {
                    expect(r.classes).not.includes('row-highlighted');
                }
            });
        });
    });

});

function createTable(): StandardTable {

    const tableConfiguration = new TableConfiguration(
        100, null, createColumns(), null, true, true, new ToggleOptions('toggle-component', 'TestObject', [], false), null,
        TableHeaderHeight.LARGE, TableRowHeight.LARGE
    )

    const layerConfiguration = new TableLayerConfiguration(
        new TestContentLayer(), new TestLabelLayer(), [new TestFilterLayer], [new TestSortLayer()],
        new TestToggleLayer(), new TestPreventSelectionLayer(), new TestHighlightLayer()
    );

    const listenerConfiguration = new TableListenerConfiguration(
        new TestClickListener(), new TestSelectionListener(), new TestConfigurationListener()
    );

    const table = new StandardTable(
        'test-table', tableConfiguration, layerConfiguration, listenerConfiguration
    );

    return table;
}

function createColumns(): TableColumnConfiguration[] {
    const columnConfigurations = [];
    columnConfigurations.push(new TableColumnConfiguration('id', true, false, true, true, 100, true, false, DataType.STRING));
    columnConfigurations.push(new TableColumnConfiguration('name', true, false, true, true, 100, true, false, DataType.STRING));
    columnConfigurations.push(new TableColumnConfiguration('value', true, false, true, true, 100, true, false, DataType.STRING));
    return columnConfigurations;
}

class TestObject extends KIXObject<TestObject> {

    public ObjectId: string | number;
    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;

    public constructor(
        public id: string,
        public name: string,
        public value: string
    ) {
        super();
    }

    public equals(object: TestObject): boolean {
        return object.id === this.id;
    }
}

class TestContentLayer extends AbstractTableLayer {

    public async getRows(): Promise<Array<TableRow<TestObject>>> {
        return Promise.resolve(this.loadData());
    }

    private async loadData(): Promise<Array<TableRow<TestObject>>> {
        const data = [];
        for (let i = 0; i < 1000; i++) {
            const testObject = new TestObject('test-object-' + i, 'TestObject' + i, 'TestObject' + i);
            const columns = await this.getColumns();
            const values = columns.map((c) => new TableValue(c.id, testObject[c.id], '', [], null));
            data.push(
                new TableRow(
                    testObject,
                    values,
                    []
                )
            );
        }
        return data;
    }

}

class TestLabelLayer extends AbstractTableLayer {
    public async getRows(): Promise<Array<TableRow<TestObject>>> {
        const rows = await this.getPreviousLayer().getRows();
        return rows.map((row) => this.setTableValues(row));
    }

    private setTableValues(row: TableRow<TestObject>): TableRow<TestObject> {
        for (const value of row.values) {
            value.displayValue = row.object[value.columnId];
        }
        return row;
    }
}

class TestFilterLayer extends AbstractTableLayer implements ITableFilterLayer {
    private filterValue: string;

    private filteredRows: Array<TableRow<TestObject>> = [];

    public async getRows(): Promise<Array<TableRow>> {
        this.filteredRows = await this.getPreviousLayer().getRows();
        if (this.filterValue) {
            const searchValue = this.filterValue.toString().toLocaleLowerCase();
            this.filteredRows = this.filteredRows.filter((row) => {
                for (const value of row.values) {
                    if (value.displayValue.indexOf(this.filterValue) !== -1) {
                        return true;
                    }
                }
                return false;
            });
        }
        return this.filteredRows;
    }

    public filter(value: string): void {
        this.filterValue = value;
    }

    public reset(): void { }
}

class TestSortLayer extends AbstractTableLayer implements ITableSortLayer {
    sort(columnId: string, sortOrder: SortOrder): void { }
}

class TestToggleLayer extends AbstractTableLayer implements ITableToggleLayer {
    registerToggleListener(listener: ITableToggleListener): void { }
    toggleRow(row: TableRow<TestObject>): void { }
    reset(): void { }
}

class TestPreventSelectionLayer extends AbstractTableLayer implements ITablePreventSelectionLayer<TestObject> {
    private testObjects: TestObject[] = [];
    setPreventSelectionFilter(objects: TestObject[]): void {
        this.testObjects = objects;
    }

    public async getRows(): Promise<any[]> {
        const rows = await this.getPreviousLayer().getRows();
        rows.forEach((tr: TableRow<TestObject>) => {
            if (this.testObjects.some((to) => to.equals(tr.object))) {
                tr.selectable = false;
            }
        });
        return rows;
    }
}

class TestHighlightLayer extends AbstractTableLayer implements ITableHighlightLayer<TestObject> {
    private testObjects: TestObject[] = [];
    setHighlightedObjects(objects: TestObject[]): void {
        this.testObjects = objects;
    }

    public async getRows(): Promise<any[]> {
        const rows = await this.getPreviousLayer().getRows();
        rows.forEach((tr: TableRow<TestObject>) => {
            if (this.testObjects.some((to) => to.equals(tr.object))) {
                tr.classes.push('row-highlighted');;
            }
        });
        return rows;
    }
}

class TestSelectionListener implements ITableSelectionListener<TestObject> {
    objectSelectionChanged(object: KIXObject<TestObject>, selected: boolean): void { }
    updateSelections(updatedRows: TableRow<TestObject>[]): void { }
    selectionChanged(row: TableRow<TestObject>, selected: boolean): void { }
    selectAll(rows: TableRow<TestObject>[]): void { }
    selectNone(): void { }
    isRowSelected(row: TableRow<TestObject>): boolean { return true; }
    isAllSelected(): boolean { return true; }
    getSelectedObjects(): TestObject[] { return []; }
    addListener(listener: (objects: TestObject[]) => void): void { };
}

class TestClickListener implements ITableClickListener<TestObject> {
    rowClicked(object: TestObject, columnId: string, event: any): void { }
}

class TestConfigurationListener implements ITableConfigurationListener {
    columnConfigurationChanged(column: TableColumn): void { }
}
