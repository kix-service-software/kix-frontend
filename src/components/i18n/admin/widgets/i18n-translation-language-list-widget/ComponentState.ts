import { WidgetComponentState, AbstractAction, KIXObjectPropertyFilter, Translation } from "../../../../../core/model";
import { ITable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: ITable = null,
        public title: string = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public filterCount: number = null,
        public translation: Translation = null
    ) {
        super();
    }

}
