import { TableConfiguration, ITable } from "../../../../core/browser";
import { WidgetComponentState, AbstractAction, Contact } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: ITable = null,
        public title: string = "Übersicht Ansprechpartner",
        public filterCount: number = null
    ) {
        super();
    }

}
