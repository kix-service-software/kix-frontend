import { WidgetComponentState, AbstractAction, KIXObjectPropertyFilter, Translation } from "../../../../../core/model";
import { StandardTable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: StandardTable = null,
        public loading: boolean = true,
        public title: string = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public filterCount: number = null,
        public translation: Translation = null
    ) {
        super();
    }

}
