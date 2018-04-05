import { WidgetComponentState, WidgetType } from "@kix/core/dist/model";

export class BaseWidgetComponentState extends WidgetComponentState {

    public constructor(
        public configChanged: boolean = false,
        public hasConfigOverlay: boolean = true,
        public isLoading: boolean = false,
        public type: WidgetType = null
    ) {
        super();
    }

}
