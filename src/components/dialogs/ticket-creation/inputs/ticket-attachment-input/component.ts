import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';

class TicketAttachmentInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        super.initialize(this.stateChanged.bind(this));
    }

    public stateChanged(state: TicketCreationReduxState): void {
        //
    }

}

module.exports = TicketAttachmentInput;
