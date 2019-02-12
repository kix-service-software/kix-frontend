import { TableLayerConfiguration, TableListenerConfiguration, TableConfiguration } from "./configuration";
import { TableLayerStack, TableConfigurationLayer, ITableLayer } from './layer';
import { TableRow, TableColumn } from '..';
import { SortOrder, KIXObject, KIXObjectPropertyFilter } from '../../model';
import { DefaultTableSelectionListener } from "./listener";

export class StandardTable<T extends KIXObject = KIXObject> {

    private layerStack: TableLayerStack;

    private limit: number;
    private minRowsLoadLimit: number;
    private currentRowsLoadLimit: number;
    private loading: boolean = false;

    private tableListener: Array<(scrollToTop?: boolean) => void> = [];

    private rows: Array<TableRow<T>> = [];

    private configurationLayer: TableConfigurationLayer;

    public constructor(
        public tableId: string,
        public tableConfiguration: TableConfiguration,
        public layerConfiguration: TableLayerConfiguration,
        public listenerConfiguration: TableListenerConfiguration
    ) {

        if (this.tableConfiguration.enableSelection && !this.listenerConfiguration.selectionListener) {
            this.listenerConfiguration.selectionListener = new DefaultTableSelectionListener<T>();
        }

        this.initLayerStack();
        this.initToggle();

        this.loadRows();
    }

    private initLayerStack(): void {
        this.layerStack = new TableLayerStack();

        this.configurationLayer = new TableConfigurationLayer(this.tableConfiguration.tableColumns);
        this.configurationLayer.setTableId(this.tableId);
        this.configurationLayer.addLayerListener(this.notifyListener.bind(this));
        this.layerStack.pushLayer(this.configurationLayer);

        this.layerConfiguration.contentLayer.setTableId(this.tableId);
        this.layerConfiguration.contentLayer.addLayerListener(this.notifyListener.bind(this));
        this.layerStack.pushLayer(this.layerConfiguration.contentLayer);

        this.layerConfiguration.labelLayer.setTableId(this.tableId);
        this.layerConfiguration.labelLayer.addLayerListener(this.notifyListener.bind(this));
        this.layerStack.pushLayer(this.layerConfiguration.labelLayer);

        this.layerConfiguration.filterLayer.forEach((l) => {
            this.layerStack.pushLayer(l);
            l.setTableId(this.tableId);
            l.addLayerListener(this.notifyListener.bind(this));
        });

        this.layerConfiguration.sortLayer.forEach((l) => {
            this.layerStack.pushLayer(l);
            l.setTableId(this.tableId);
            l.addLayerListener(this.notifyListener.bind(this));
        });

        if (this.layerConfiguration.preventSelectionLayer) {
            this.layerConfiguration.preventSelectionLayer.setTableId(this.tableId);
            this.layerConfiguration.preventSelectionLayer.addLayerListener(this.notifyListener.bind(this));
            this.layerStack.pushLayer(this.layerConfiguration.preventSelectionLayer);
        }

        if (this.layerConfiguration.highlightLayer) {
            this.layerConfiguration.highlightLayer.setTableId(this.tableId);
            this.layerConfiguration.highlightLayer.addLayerListener(this.notifyListener.bind(this));
            this.layerStack.pushLayer(this.layerConfiguration.highlightLayer);
        }
    }

    private initToggle(): void {
        if (this.tableConfiguration.toggle
            && this.tableConfiguration.toggleOptions
            && this.layerConfiguration.toggleLayer) {

            this.layerStack.pushLayer(this.layerConfiguration.toggleLayer);
            this.layerConfiguration.toggleLayer.addLayerListener(this.notifyListener.bind(this));
            this.layerConfiguration.toggleLayer.setTableId(this.tableId);
        } else if (this.tableConfiguration.toggle) {
            console.warn('toggle disabled - no toggleOptions or toggleLayer given!');
            this.tableConfiguration.toggle = false;
        }
    }

    public addAdditionalLayerOnTop(layer: ITableLayer): void {
        this.layerStack.pushLayer(layer);
    }

    public isToggleEnabled(): boolean {
        return this.tableConfiguration.toggle !== null
            && this.tableConfiguration.toggleOptions !== null
            && this.layerConfiguration.toggleLayer !== null;
    }

    public getTableRows(all: boolean = false): Array<TableRow<T>> {
        let tableRows = this.rows;
        if (!all) {
            tableRows = tableRows.slice(0, this.currentRowsLoadLimit);
        }
        return tableRows;
    }

    public async loadRows(refresh: boolean = false): Promise<void> {
        this.loading = true;
        this.notifyListener(true);
        this.rows = await this.layerStack.getTopLayer().getRows(refresh);
        this.setLimits();
        this.loading = false;
        this.notifyListener(true);
    }

    private setLimits(): void {
        this.limit = this.rows.length;
        if (this.tableConfiguration.displayLimit && this.limit > 100) {
            if (this.tableConfiguration.displayLimit > this.limit / 10) {
                this.minRowsLoadLimit = this.tableConfiguration.displayLimit;
                this.currentRowsLoadLimit = this.tableConfiguration.displayLimit;
            } else {
                this.minRowsLoadLimit = this.limit / 10;
                this.currentRowsLoadLimit = this.limit / 10;
            }
        } else {
            this.minRowsLoadLimit = this.limit;
            this.currentRowsLoadLimit = this.limit;
        }
    }

    public setLoading(loading: boolean): void {
        this.loading = loading;
        this.notifyListener(false);
    }

    public async getColumns(): Promise<TableColumn[]> {
        return await this.layerStack.getTopLayer().getColumns();
    }

    public setTableListener(listener: (scrollToTop?: boolean) => void): void {
        this.tableListener.push(listener);
    }

    public notifyListener(scrollToTop?: boolean): void {
        if (this.tableListener.length) {
            this.tableListener.forEach((listener) => listener(scrollToTop));
        }
    }

    public increaseCurrentRowsLoadLimit(): void {
        this.currentRowsLoadLimit += this.minRowsLoadLimit;
        if (this.currentRowsLoadLimit >= this.limit - this.minRowsLoadLimit) {
            this.currentRowsLoadLimit = this.limit;
        }
    }

    public getMinRowsLoadLimit(): number {
        return this.minRowsLoadLimit;
    }

    public getCurrentRowsLoadLimit(): number {
        return this.currentRowsLoadLimit;
    }

    public getLimit(): number {
        return this.limit;
    }

    public setSortSettings(columnId: string, sortOrder: SortOrder) {
        this.layerConfiguration.sortLayer.forEach((l) => l.sort(columnId, sortOrder));
        this.loadRows();
    }

    public async setFilterSettings(value: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (!value && !filter) {
            this.resetFilter();
        } else {
            this.layerConfiguration.filterLayer.forEach((f) => f.filter(value, filter));
            if (this.layerConfiguration.toggleLayer) {
                this.layerConfiguration.toggleLayer.reset();
            }
            await this.loadRows();
        }
    }

    public resetFilter(): void {
        this.layerConfiguration.filterLayer.forEach((f) => f.reset());
        if (this.layerConfiguration.toggleLayer) {
            this.layerConfiguration.toggleLayer.reset();
        }
        this.loadRows();
    }

    public async toggleRow(row: TableRow<T>): Promise<void> {
        this.layerConfiguration.toggleLayer.toggleRow(row);
    }

    public isLoading(): boolean {
        return this.loading;
    }

    public getEmptyResultHint(): string {
        return this.tableConfiguration.emptyResultHint;
    }

    public setColumns(tableColumns: TableColumn[]): void {
        this.configurationLayer.addColumns(tableColumns);
        this.notifyListener();
    }

}
