import { WidgetConfiguration } from './WidgetConfiguration';
import { UIComponentPermission } from '../../UIComponentPermission';

export class ConfiguredWidget<T = any> {
    public constructor(
        public instanceId: string,
        public configuration: WidgetConfiguration<T>,
        public permissions: UIComponentPermission[] = []
    ) { }
}
