import { WidgetConfiguration, ObjectIcon, IAction } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = '201800709-search-result-list-widget',
        public widgetConfiguration: WidgetConfiguration = null,
        public resultTitle: string = "Hit List:",
        public resultIcon: string | ObjectIcon = null,
        public table: ITable = null,
        public noSearch: boolean = true,
        public actions: IAction[] = [],
        public loading: boolean = false,
        public tableId: string = null,
        public filterCount: number = null
    ) { }

}
