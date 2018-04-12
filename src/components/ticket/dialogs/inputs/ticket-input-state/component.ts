import { TicketInputStateComponentState } from "./TicketInputStateComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropDownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";

class TicketInputStateComponent {

    private state: TicketInputStateComponentState;

    public onCreate(): void {
        this.state = new TicketInputStateComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.states.map((t) =>
            new FormDropDownItem(t.ID, new ObjectIcon(TicketProperty.STATE_ID, t.ID), t.Name)
        );
    }

}

module.exports = TicketInputStateComponent;
