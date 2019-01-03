import { WidgetComponentState, AbstractAction, KIXObject } from "../../../core/model";
import { StandardTable } from "../../../core/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public kixObject: KIXObject = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public linkedObjectGroups: Array<[string, StandardTable, number]> = [],
        public widgetTitle: string = ''
    ) {
        super();
    }

}
