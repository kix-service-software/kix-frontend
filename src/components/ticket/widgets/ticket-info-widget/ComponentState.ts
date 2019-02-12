import { ILabelProvider } from '../../../../core/browser';
import { AbstractAction, Ticket, WidgetComponentState } from '../../../../core/model';

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public ticket: Ticket = null,
        public isPending: boolean = false,
        public isAccountTimeEnabled: boolean = false,
        public labelProvider: ILabelProvider<Ticket> = null,
        public actions: AbstractAction[] = [],
        public customerInfoGroups: string[] = null,
        public contactInfoGroups: string[] = null
    ) {
        super();
    }

}
