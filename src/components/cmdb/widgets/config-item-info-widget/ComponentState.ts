import { WidgetComponentState, AbstractAction, ConfigItem } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

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
