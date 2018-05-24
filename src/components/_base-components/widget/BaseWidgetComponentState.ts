import { WidgetComponentState, WidgetType, ContextType } from "@kix/core/dist/model";

export class BaseWidgetComponentState extends WidgetComponentState {

    public constructor(
        public configChanged: boolean = false,
        public hasConfigOverlay: boolean = true,
        public isLoading: boolean = false,
        public widgetType: WidgetType = null,
        public isDialog: WidgetType = null,
        public contextType: ContextType = null
    ) {
        super();
    }

}
