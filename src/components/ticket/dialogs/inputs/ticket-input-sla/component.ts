import { TicketInputSLAComponentState } from "./TicketInputSLAComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState } from "@kix/core/dist/model";

class TicketInputSLAComponent {

    private state: TicketInputSLAComponentState;

    public onCreate(): void {
        this.state = new TicketInputSLAComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.slas.map((s) =>
            new FormDropdownItem(s.ID, new ObjectIcon(TicketProperty.SLA_ID, s.ID), s.Name)
        );
    }

}

module.exports = TicketInputSLAComponent;
