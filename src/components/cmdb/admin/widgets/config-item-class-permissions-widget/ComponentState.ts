import { WidgetComponentState, ConfigItemClass, AbstractAction } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public ciClass: ConfigItemClass = null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
