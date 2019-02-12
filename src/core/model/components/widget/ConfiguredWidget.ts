import { WidgetConfiguration } from './WidgetConfiguration';

export class ConfiguredWidget<T = any> {
    public constructor(public instanceId: string, public configuration: WidgetConfiguration<T>) { }
}
