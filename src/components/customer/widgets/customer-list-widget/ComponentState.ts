import { TableConfiguration, ITable } from "../../../../core/browser";
import { Customer, WidgetComponentState, AbstractAction } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: ITable = null,
        public title: string = "Übersicht Kunden",
        public filterCount: number = null
    ) {
        super();
    }

}
