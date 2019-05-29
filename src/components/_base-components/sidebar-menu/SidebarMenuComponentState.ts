import { ConfiguredWidget, ContextType } from "../../../core/model";
import { AbstractComponentState } from "../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public sidebars: ConfiguredWidget[] = [],
        public contextType: ContextType = null
    ) {
        super();
    }

}
