import { StandardTableConfiguration } from '@kix/core/dist/browser';
import { ResizeSettings } from './ResizeSettings';

export class StandardTableComponentState<T = any> {

    public tableConfiguration: StandardTableConfiguration<T> = null;

    public resizeSettings: ResizeSettings = new ResizeSettings();

    public rows: T[] = [];
}
