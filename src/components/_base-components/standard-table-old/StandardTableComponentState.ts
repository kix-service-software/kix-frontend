import { StandardTable, TableRow } from '@kix/core/dist/browser';
import { ResizeSettings } from './ResizeSettings';
import { IdService } from '@kix/core/dist/browser/IdService';
import { SortOrder, KIXObject, AbstractAction } from '@kix/core/dist/model';

export class StandardTableComponentState<T extends KIXObject<T>> {

    public standardTable: StandardTable<T> = null;

    public resizeSettings: ResizeSettings = new ResizeSettings();

    public resizeActive: boolean = false;

    public tableId: string = null;

    public sortedColumnId: string = null;

    public sortOrder: SortOrder = null;

    public rowWidth: number = 0;

}
