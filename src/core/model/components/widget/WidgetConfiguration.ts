import { WidgetSize } from './WidgetSize';
import { KIXObjectPropertyFilter } from '../filter';

export class WidgetConfiguration<T = any> {

    public constructor(
        public widgetId: string,
        public title: string,
        public actions: string[],
        public settings: T,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public size: WidgetSize = WidgetSize.BOTH,
        public icon: string = '',
        public contextDependent: boolean = false,
        public predefinedTableFilters: KIXObjectPropertyFilter[] = [],
        public show: boolean = true
    ) { }

}
