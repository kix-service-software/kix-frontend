import { WidgetComponentState } from "../../../../core/model";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public show: boolean = false
    ) {
        super();
    }

}
