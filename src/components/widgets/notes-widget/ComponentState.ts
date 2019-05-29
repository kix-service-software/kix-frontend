import { WidgetConfiguration, ContextType, AbstractAction } from '../../../core/model';
import { AbstractComponentState } from '../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = null,
        public widgetConfiguration: WidgetConfiguration = null,
        public contextType: ContextType = null,
        public contextId: string = null,
        public actions: AbstractAction[] = [],
        public editorActive: boolean = false,
        public value: string = null
    ) {
        super();
    }

}
