import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";

class TicketInputServiceComponent {

    private state: TicketInputServiceComponentState;

    public onCreate(): void {
        this.state = new TicketInputServiceComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.services.map((s) => {
            const incidentStateID = s.IncidentState ? s.IncidentState.CurInciStateID : null;
            return new FormDropdownItem(
                s.ServiceID,
                new ObjectIcon(TicketProperty.SERVICE_ID, s.ServiceID),
                s.Name,
                incidentStateID ? new ObjectIcon("CurInciStateID", s.ServiceID) : null
            );
        });
    }

}

module.exports = TicketInputServiceComponent;
