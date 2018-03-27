import {
    DashboardConfiguration,
    SelectWithFilterListElement,
    SelectWithPropertiesListElement,
    WidgetDescriptor,
} from '@kix/core/dist/model';

export class DashboardConfigurationDialogComponentState {
    public constructor(
        public explorerList: any[] = [],
        public explorerProperties: any[] = [],
        public contentFirstList: SelectWithFilterListElement[],
        public contentSecondList: SelectWithPropertiesListElement[],
        public contentProperties: any[],
        public sidebarFirstList: SelectWithFilterListElement[],
        public sidebarSecondList: SelectWithPropertiesListElement[],
        public sidebarProperties: any[],
        public dashboardConfig: DashboardConfiguration,
        public widgetDescriptorList: Array<{ listId: string, descriptor: WidgetDescriptor }>
    ) { }
}
