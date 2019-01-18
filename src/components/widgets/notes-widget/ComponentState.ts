import { WidgetConfiguration, ContextType, AbstractAction } from '../../../core/model';

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public contextId: string = null,
        public actions: AbstractAction[] = [],
        public editorActive: boolean = false,
        public value: string = null
    ) { }

}
