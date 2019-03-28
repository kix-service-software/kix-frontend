import { WidgetConfiguration } from '../..';
import { ContextType } from '../context';
import { AbstractComponentState } from '../../../browser/components/AbstractComponentState';

export abstract class WidgetComponentState<T = any> extends AbstractComponentState {

    public constructor(
        public widgetConfiguration: WidgetConfiguration<T> = null,
        public contextType: ContextType = null,
        public showConfiguration: boolean = false,
        public error: string = null,
        public instanceId: string = null,
        public explorer: boolean = false,
        public minimized: boolean = false,
        public minimizable: boolean = true,
        public closable: boolean = false
    ) {
        super();
    }

}
