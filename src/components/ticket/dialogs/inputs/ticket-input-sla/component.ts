import { TicketInputSLAComponentState } from "./TicketInputSLAComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

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

    private itemChanged(node: FormDropdownItem): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, new FormFieldValue<number>(Number(node.id)));
    }

}

module.exports = TicketInputSLAComponent;
