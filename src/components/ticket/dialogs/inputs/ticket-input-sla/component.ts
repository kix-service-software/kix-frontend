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

        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value);
            }
        }
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<number>(
            this.state.field.property, (item ? Number(item.id) : null)
        );
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = TicketInputSLAComponent;
