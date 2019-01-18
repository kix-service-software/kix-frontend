import { WidgetComponentState, AbstractAction, ConfigItemClass } from "../../../../../core/model";
import { ConfigItemClassLabelProvider } from "../../../../../core/browser/cmdb";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: ConfigItemClassLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ciClass: ConfigItemClass = null
    ) {
        super();
    }

}
