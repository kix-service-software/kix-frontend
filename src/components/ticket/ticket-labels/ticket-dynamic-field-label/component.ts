import { TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";
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
        if (id === this.state.ticketId && type === TicketNotification.TICKET_DETAILS_LOADED) {
            this.setDisplayValue();
        }
    }

    private setDisplayValue(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.field = objectData.dynamicFields.find((df) => df.ID === this.state.fieldId);
            if (this.state.field) {
                const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
                if (ticketDetails && ticketDetails.ticket) {
                    const field = ticketDetails.ticket.DynamicFields.find((df) => df.ID === this.state.fieldId);
                    if (field) {
                        this.state.value = field.Value;
                        this.state.displayValue = field.DisplayValue;

                        if (this.state.field.FieldType === "Date") {
                            this.state.displayValue = TicketUtil.getDateString(field.DisplayValue);
                        } else if (this.state.field.FieldType === "DateTime") {
                            this.state.displayValue = TicketUtil.getDateTimeString(field.DisplayValue);
                        }
                    }
                }
            }
        }
    }
}

module.exports = TicketPriorityLabelComponent;
