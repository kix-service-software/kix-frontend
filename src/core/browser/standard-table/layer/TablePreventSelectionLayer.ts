import { ITablePreventSelectionLayer, TableColumn, TableRow } from '..';
import { AbstractTableLayer } from './AbstractTableLayer';
import { KIXObject } from '../../../model';

export class TablePreventSelectionLayer<T extends KIXObject>
    extends AbstractTableLayer
    implements ITablePreventSelectionLayer<T> {

    private objects: KIXObject[] = [];

    public setPreventSelectionFilter(objects: T[]): void {
        this.objects = objects || [];
    }

    public async getRows(refresh: boolean = false): Promise<any[]> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        rows.forEach((tr: TableRow<T>) => {
            if (this.objects.some((t) => t.equals(tr.object))) {
                tr.selectable = false;
            }
        });
        return rows;
    }
}
