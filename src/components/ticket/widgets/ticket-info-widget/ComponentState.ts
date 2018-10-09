import { ILabelProvider } from '@kix/core/dist/browser';
import { AbstractAction, Ticket, WidgetComponentState } from '@kix/core/dist/model';

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public ticket: Ticket = null,
        public isPending: boolean = false,
        public isAccountTimeEnabled: boolean = false,
        public labelProvider: ILabelProvider<Ticket> = null,
        public actions: AbstractAction[] = [],
        public customerInfoGroups: string[] = null
    ) {
        super();
    }

}
