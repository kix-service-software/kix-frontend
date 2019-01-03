import { TableColumn } from '../TableColumn';
import { TableRow } from '../TableRow';
import { KIXObject } from '../../../model';

export interface ITableLayer {

    addLayerListener(listener: () => void): void;

    getPreviousLayer(): ITableLayer;

    getNextLayer(): ITableLayer;

    setNextLayer(layer: ITableLayer): void;

    setPreviousLayer(layer: ITableLayer): void;

    getColumns(): Promise<TableColumn[]>;

    getRows(refresh?: boolean): Promise<Array<TableRow<any>>>;

    setTableId(tableId: string): void;

    setPreloadedObjects<T extends KIXObject>(objects: T[]): void;

}
