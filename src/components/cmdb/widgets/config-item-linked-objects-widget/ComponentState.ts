import { WidgetComponentState, AbstractAction, ConfigItem } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public linkedObjectGroups: Array<[string, StandardTable]> = [],
        public widgetTitle: string = ''
    ) {
        super();
    }

}
