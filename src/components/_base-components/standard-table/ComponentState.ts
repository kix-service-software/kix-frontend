import { StandardTable } from '@kix/core/dist/browser';
import { ResizeSettings } from './ResizeSettings';
import { SortOrder, KIXObject } from '@kix/core/dist/model';

export class ComponentState<T extends KIXObject<T>> {

    public standardTable: StandardTable<T> = null;

    public resizeSettings: ResizeSettings = new ResizeSettings();

    public tableId: string = null;

    public sortedColumnId: string = null;

    public sortOrder: SortOrder = null;

    public loading: boolean = true;

}
