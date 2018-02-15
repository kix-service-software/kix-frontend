import { TicketNotification, TicketUtil, TicketService } from "@kix/core/dist/browser/ticket/";
import { TicketProperty } from "@kix/core/dist/model/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context/";

export class TicketStateLabelComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            serviceId: input.value,
            displayValue: null,
            label: null,
            ticketId: null,
            incidentStateId: null
        };
    }

    public onInput(input: any): void {
        this.state = {
            serviceId: input.value,
            ticketId: Number(input.ticketId)
        };
    }

    public onMount(): void {
        this.setDisplayValue();
    }

    private setDisplayValue(): void {
        this.state.label = TicketUtil.getPropertyName(TicketProperty.SERVICE_ID);
        this.state.displayValue =
            TicketUtil.getPropertyValue(TicketProperty.SERVICE_ID, this.state.serviceId, this.state.ticketId);

        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            const service = objectData.services.find((s) => s.ServiceID === this.state.serviceId);
            if (service) {
                this.state.incidentStateId = service.IncidentState.CurInciStateID;
            }
        }
    }
}

module.exports = TicketStateLabelComponent;
