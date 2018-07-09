import { WidgetConfiguration, ObjectIcon, KIXObject, IAction } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public instanceId: string = 'search-result-list-widget',
        public widgetConfiguration: WidgetConfiguration = null,
        public criterias: Array<[string, string, string]> = [],
        public resultTitle: string = "Trefferliste:",
        public resultIcon: string | ObjectIcon = null,
        public resultTable: StandardTable<KIXObject> = null,
        public noSearch: boolean = true,
        public actions: IAction[] = []
    ) { }

}
