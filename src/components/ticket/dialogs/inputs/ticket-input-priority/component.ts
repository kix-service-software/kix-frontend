import { TicketInputPriorityComponentState } from "./TicketInputPriorityComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState } from "@kix/core/dist/model";

class TicketInputPriorityComponent {

    private state: TicketInputPriorityComponentState;

    public onCreate(): void {
        this.state = new TicketInputPriorityComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.priorities.map((p) =>
            new FormDropdownItem(p.ID, new ObjectIcon(TicketProperty.PRIORITY_ID, p.ID), p.Name)
        );
    }

}

module.exports = TicketInputPriorityComponent;
