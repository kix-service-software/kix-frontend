import { WidgetComponentState, AbstractAction, ConfigItemClass } from "@kix/core/dist/model";
import { ConfigItemClassLabelProvider } from "@kix/core/dist/browser/cmdb";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: ConfigItemClassLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ciClass: ConfigItemClass = null
    ) {
        super();
    }

}
