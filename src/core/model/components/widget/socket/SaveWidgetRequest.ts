import { WidgetConfiguration } from '..';

export class SaveWidgetRequest<T = any> {
    public constructor(
        public token: string,
        public contextId: string,
        public instanceId: string,
        public widgetConfiguration: WidgetConfiguration<T>
    ) { }
}
