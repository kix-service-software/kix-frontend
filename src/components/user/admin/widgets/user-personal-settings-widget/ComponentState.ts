import { WidgetComponentState, AbstractAction, User } from "../../../../../core/model";
import { UserLabelProvider } from "../../../../../core/browser/user";
import { Label } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public actions: AbstractAction[] = [],
        public labelProvider: UserLabelProvider = null,
        public user: User = null,
        public labels: Label[] = []
    ) {
        super();
    }

}
