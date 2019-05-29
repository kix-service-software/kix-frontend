import { WidgetComponentState, AbstractAction, Role } from "../../../../../core/model";
import { RoleLabelProvider } from "../../../../../core/browser/user";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: RoleLabelProvider = null,
        public actions: AbstractAction[] = [],
        public role: Role = null
    ) {
        super();
    }

}
