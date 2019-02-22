import { WidgetComponentState, AbstractAction, KIXObject, CreateLinkDescription } from "../../../core/model";
import { ITable } from "../../../core/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public kixObject: KIXObject = null,
        public actions: AbstractAction[] = [],
        public linkedObjectGroups: Array<[string, ITable, number, CreateLinkDescription[]]> = [],
        public title: string = ''
    ) {
        super();
    }

}
