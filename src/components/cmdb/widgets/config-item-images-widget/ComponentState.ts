import { WidgetComponentState, AbstractAction, ConfigItem } from "@kix/core/dist/model";
import { DisplayImageDescription } from "@kix/core/dist/browser/components/DisplayImageDescription";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public widgetTitle: string = '',
        public thumbnails: DisplayImageDescription[] = []
    ) {
        super();
    }

}
