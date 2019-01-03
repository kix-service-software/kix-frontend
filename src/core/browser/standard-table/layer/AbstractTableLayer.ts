import { ITableLayer } from "./ITableLayer";
import { TableColumn } from "../TableColumn";
import { TableRow } from "../TableRow";
import { KIXObject } from "../../../model";
import { StandardTable } from "../StandardTable";

export abstract class AbstractTableLayer implements ITableLayer {

    protected nextLayer: ITableLayer;

    protected previousLayer: ITableLayer;

    private listener: Array<() => void> = [];

    protected tableId: string;

    public addLayerListener(listener: () => void): void {
        this.listener.push(listener);
    }

    public setNextLayer(layer: ITableLayer): void {
        this.nextLayer = layer;
    }

    public setPreviousLayer(layer: ITableLayer): void {
        this.previousLayer = layer;
    }

    public getPreviousLayer(): ITableLayer {
        return this.previousLayer;
    }

    public getNextLayer(): ITableLayer {
        return this.nextLayer;
    }

    public async getColumns(): Promise<TableColumn[]> {
        return await this.getPreviousLayer().getColumns();
    }

    public async getRows(refresh: boolean = false): Promise<TableRow[]> {
        return await this.getPreviousLayer().getRows(refresh);
    }

    public setTableId(tableId: string): void {
        this.tableId = tableId;
    }

    public setPreloadedObjects<O extends KIXObject>(objects: O[]): void {
        return;
    }

}
