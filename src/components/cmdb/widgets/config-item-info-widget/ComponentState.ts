import { WidgetComponentState, AbstractAction, ConfigItem } from "../../../../core/model";
import { Label } from "../../../../core/browser/components";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public actions: AbstractAction[] = [],
        public labels: Label[] = [],
        public loading: boolean = true
    ) {
        super();
    }

}
