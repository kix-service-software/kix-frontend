import { StandardTableConfiguration } from '@kix/core/dist/browser';
import { ResizeSettings } from './ResizeSettings';
import { IdService } from '@kix/core/dist/browser/IdService';

export class StandardTableComponentState<T = any> {

    public tableConfiguration: StandardTableConfiguration<T> = null;

    public resizeSettings: ResizeSettings = new ResizeSettings();

    public rows: T[] = [];

    public tableId: string = IdService.generateDateBasedRandomId();
}
