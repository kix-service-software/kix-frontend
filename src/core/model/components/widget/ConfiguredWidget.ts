import { WidgetConfiguration } from './WidgetConfiguration';
import { UIComponentPermission } from '../../UIComponentPermission';
import { WidgetSize } from './WidgetSize';

export class ConfiguredWidget<T = any> {
    public constructor(
        public instanceId: string,
        public configuration: WidgetConfiguration<T>,
        public permissions: UIComponentPermission[] = [],
        public size: WidgetSize = WidgetSize.LARGE,
    ) { }
}
