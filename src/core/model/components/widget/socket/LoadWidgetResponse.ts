import { WidgetConfiguration } from '..';

export class LoadWidgetResponse<T = any> {

    public constructor(public configuration: WidgetConfiguration<T>) {
        this.configuration = configuration;
    }
}
