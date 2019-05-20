import { WidgetComponentState, AbstractAction, SystemAddress } from "../../../../../core/model";
import { SystemAddressLabelProvider } from "../../../../../core/browser/system-address";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: SystemAddressLabelProvider = null,
        public actions: AbstractAction[] = [],
        public systemAddress: SystemAddress = null
    ) {
        super();
    }

}
