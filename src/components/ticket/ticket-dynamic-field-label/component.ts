import { TicketNotification, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty, DateTimeUtil } from "@kix/core/dist/model/";
import { ContextService } from "@kix/core/dist/browser/context/";
import { DynamicFieldLabelComponentState } from './DynamicFieldLabelComponentState';

export class TicketPriorityLabelComponent {

    private state: DynamicFieldLabelComponentState;

    public onCreate(input: any): void {
        this.state = new DynamicFieldLabelComponentState();
    }

    public onInput(input: any): void {
        this.state.fieldId = Number(input.value);
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        this.setDisplayValue();
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        if (id === this.state.ticketId && type === TicketNotification.TICKET_LOADED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.field = objectData.dynamicFields.find((df) => df.ID === this.state.fieldId);
            if (this.state.field) {
                const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
                if (ticket) {
                    const field = ticket.DynamicFields.find((df) => df.ID === this.state.fieldId);
                    if (field) {
                        this.state.value = field.Value;
                        this.state.displayValue = field.DisplayValue;

                        if (this.state.field.FieldType === "Date") {
                            this.state.displayValue = DateTimeUtil.getDateString(field.DisplayValue);
                        } else if (this.state.field.FieldType === "DateTime") {
                            this.state.displayValue = DateTimeUtil.getDateTimeString(field.DisplayValue);
                        }
                    }
                }
            }
        }
    }
}

module.exports = TicketPriorityLabelComponent;
