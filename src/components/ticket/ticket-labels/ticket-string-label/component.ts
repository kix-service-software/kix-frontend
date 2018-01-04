import { TicketService } from '@kix/core/dist/browser/ticket/TicketService';
import { TicketProperty, TicketState } from '@kix/core/dist/model/';

export class TicketStringLabelComponent {

    private state: any;

    public onCreate(input: any) {
        this.state = {
            value: null,
            displayValue: null,
            ticketDataId: null,
            property: null
        };
    }

    public onInput(input: any): void {
        this.state.value = input.value;
        this.state.ticketDataId = input.ticketDataId;
        this.state.property = input.property;
        this.setDisplayValue();
    }

    public onMount(): void {
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
        this.setDisplayValue();
    }

    private ticketStateChanged(): void {
        this.setDisplayValue();
    }

    private setDisplayValue(): void {
        const data = TicketService.getInstance().getTicketData(this.state.ticketDataId);
        let value = this.state.value;
        const property = this.state.property;
        if (data) {
            switch (property) {
                case TicketProperty.QUEUE_ID:
                    const queue = data.queues.find((q) => Number(q.QueueID) === this.state.value);
                    if (queue) {
                        value = queue.Name;
                    }
                    break;

                case TicketProperty.RESPONSIBLE_ID:
                    const responsible = data.users.find((u) => Number(u.UserID) === this.state.value);
                    if (responsible) {
                        value = responsible.UserFullname;
                    }
                    break;

                case TicketProperty.OWNER_ID:
                    const owner = data.users.find((u) => Number(u.UserID) === this.state.value);
                    if (owner) {
                        value = owner.UserFullname;
                    }
                    break;

                case TicketProperty.STATE_ID:
                    const state = data.states.find((s) => Number(s.ID) === this.state.value);
                    if (state) {
                        value = state.Name;
                    }
                    break;

                case TicketProperty.TYPE_ID:
                    const type = data.types.find((t) => Number(t.ID) === this.state.value);
                    if (type) {
                        value = type.Name;
                    }
                    break;

                case TicketProperty.PRIORITY_ID:
                    const priority = data.priorities.find((p) => Number(p.ID) === this.state.value);
                    if (priority) {
                        value = priority.Name;
                    }
                    break;

                case TicketProperty.SERVICE_ID:
                    const service = data.services.find((s) => s.ServiceID === this.state.value);
                    if (service) {
                        value = service.Name;
                    }
                    break;

                case TicketProperty.SLA_ID:
                    const sla = data.slas.find((s) => s.SLAID === this.state.value);
                    if (sla) {
                        value = sla.Name;
                    }
                    break;

                case TicketProperty.AGE:
                    const days = Math.round(this.state.value / 86400); // Age = Sekunden -> Umrechnung in Tage
                    value = days + 'd';
                    break;

                default:
                    value = value;
            }
        }
        this.state.displayValue = value;
    }

}

module.exports = TicketStringLabelComponent;
