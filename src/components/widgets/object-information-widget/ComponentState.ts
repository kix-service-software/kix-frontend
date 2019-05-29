import { WidgetComponentState, KIXObject, AbstractAction } from "../../../core/model";
import { ILabelProvider } from "../../../core/browser";
import { RoutingConfiguration } from "../../../core/browser/router";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public object: KIXObject = null,
        public actions: AbstractAction[] = [],
        public properties: string[] = [],
        public flat: boolean = false,
        public routingConfigurations: Array<[string, RoutingConfiguration]> = null
    ) {
        super();
    }

}
