import { ILabelProvider } from '../../../../core/browser';
import { AbstractAction, Ticket, WidgetComponentState, Organisation, Contact } from '../../../../core/model';

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public ticket: Ticket = null,
        public isPending: boolean = false,
        public isAccountTimeEnabled: boolean = false,
        public labelProvider: ILabelProvider<Ticket> = null,
        public actions: AbstractAction[] = [],
        public organisationProperties: string[] = null,
        public contactProperties: string[] = null,
        public organisation: Organisation = null,
        public contact: Contact = null
    ) {
        super();
    }

}
