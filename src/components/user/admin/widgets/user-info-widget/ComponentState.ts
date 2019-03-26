import { WidgetComponentState, AbstractAction, User } from "../../../../../core/model";
import { UserLabelProvider } from "../../../../../core/browser/user";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: UserLabelProvider = null,
        public actions: AbstractAction[] = [],
        public user: User = null
    ) {
        super();
    }

}
