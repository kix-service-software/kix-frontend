import { TableColumn, TableRow, ITableHighlightLayer } from '..';
import { AbstractTableLayer } from './AbstractTableLayer';
import { KIXObject } from '../../../model';

export class TableHighlightLayer<T extends KIXObject> extends AbstractTableLayer implements ITableHighlightLayer<T> {

    private objects: KIXObject[] = [];

    public constructor(private cssClass: string = 'row-highlighted') {
        super();
    }

    public setHighlightedObjects(objects: T[]): void {
        this.objects = objects;
    }

    public async getRows(refresh: boolean = false): Promise<any[]> {
        const rows = await this.getPreviousLayer().getRows(refresh);
        rows.forEach((tr: TableRow<T>) => {
            if (this.objects.some((o) => o.equals(tr.object))) {
                tr.classes.push(this.cssClass);
            }
        });
        return rows;
    }
}
