import { WidgetConfiguration } from "./WidgetConfiguration";
import { WidgetType } from './WidgetType';

export class WidgetDescriptor<T = any> {

    public constructor(
        public widgetId: string,
        public configuration: WidgetConfiguration<T>,
        public type: WidgetType,
        public required: boolean = false
    ) { }
}
