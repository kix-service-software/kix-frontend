import { WidgetConfiguration, ContextType, AbstractAction } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public actions: AbstractAction[] = [],
        public editorActive: boolean = false
    ) { }

}
