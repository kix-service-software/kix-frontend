import { WidgetConfiguration, ObjectIcon, KIXObject, IAction } from "../../../../core/model";
import { StandardTable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = '201800709-search-result-list-widget',
        public widgetConfiguration: WidgetConfiguration = null,
        public resultTitle: string = "Trefferliste:",
        public resultIcon: string | ObjectIcon = null,
        public resultTable: StandardTable<KIXObject> = null,
        public noSearch: boolean = true,
        public actions: IAction[] = [],
        public loading: boolean = false,
        public tableId: string = null,
        public filterCount: number = null
    ) { }

}
