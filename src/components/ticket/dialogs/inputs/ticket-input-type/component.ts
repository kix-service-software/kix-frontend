import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropDownItem, ObjectIcon, TicketProperty } from "@kix/core/dist/model";

class TicketInputTypeComponent {

    private state: TicketInputTypeComponentState;

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input): void {
        this.state.field = input.field;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.types.map((t) =>
            new FormDropDownItem(t.ID, new ObjectIcon(TicketProperty.TYPE_ID, t.ID), t.Name)
        );
    }

}

module.exports = TicketInputTypeComponent;
