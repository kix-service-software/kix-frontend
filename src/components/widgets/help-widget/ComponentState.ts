import { ContextType, WidgetComponentState } from '@kix/core/dist/model';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contextType: ContextType = ContextType.MAIN,
        public helpText: string = null
    ) {
        super();
    }

}
