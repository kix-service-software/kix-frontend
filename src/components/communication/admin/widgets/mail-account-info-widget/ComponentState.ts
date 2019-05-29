import { WidgetComponentState, AbstractAction, MailAccount } from "../../../../../core/model";
import { RoutingConfiguration } from "../../../../../core/browser/router";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public account: MailAccount = null,
        public actions: AbstractAction[] = [],
        public properties: string[] = [],
        public routingConfigurations: Array<[string, RoutingConfiguration]> = null
    ) {
        super();
    }

}
