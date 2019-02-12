import { WidgetComponentState, WidgetType, ContextType } from "../../../core/model";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public widgetType: WidgetType = null,
        public isDialog: WidgetType = null,
        public contextType: ContextType = null,
    ) {
        super();
    }

}
