import { StandardTableConfiguration } from '@kix/core/dist/browser';
import { ResizeSettings } from './ResizeSettings';
import { IdService } from '@kix/core/dist/browser/IdService';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';

export class StandardTableComponentState<T = any> {

    public tableConfiguration: StandardTableConfiguration<T> = null;

    public resizeSettings: ResizeSettings = new ResizeSettings();

    public resizeActive: boolean = false;

    public rows: T[] = [];

    public tableId: string = IdService.generateDateBasedRandomId();

    public sortedColumnId: string = null;

    public sortOrder: SortOrder = null;

    public toggledRows: number[] = [];

    public selectedRows: string[] | number[];

}
