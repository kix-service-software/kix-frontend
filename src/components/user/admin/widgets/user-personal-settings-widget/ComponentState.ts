import { WidgetComponentState, AbstractAction, User } from "../../../../../core/model";
import { UserLabelProvider } from "../../../../../core/browser/user";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public actions: AbstractAction[] = [],
        public labelProvider: UserLabelProvider = null,
        public user: User = null
    ) {
        super();
    }

}
