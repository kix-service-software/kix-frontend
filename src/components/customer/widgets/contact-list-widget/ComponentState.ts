import { StandardTable, TableConfiguration } from "../../../../core/browser";
import { WidgetComponentState, AbstractAction, Contact } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public standardTable: StandardTable<Contact> = null,
        public title: string = "Übersicht Ansprechpartner",
        public filterCount: number = null
    ) {
        super();
    }

}
