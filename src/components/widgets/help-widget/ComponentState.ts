import { ContextType, WidgetComponentState } from '../../../core/model';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contextType: ContextType = ContextType.MAIN,
        public helpText: string = null
    ) {
        super();
    }

}
