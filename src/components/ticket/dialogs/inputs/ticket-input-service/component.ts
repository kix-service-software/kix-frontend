import { TicketInputServiceComponentState } from "./TicketInputServiceComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropDownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";

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
        this.state.items = objectData.services.map((s) =>
            new FormDropDownItem(s.ServiceID, new ObjectIcon(TicketProperty.SERVICE_ID, s.ServiceID), s.Name)
        );
    }

}

module.exports = TicketInputServiceComponent;
