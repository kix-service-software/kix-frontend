import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, TreeNode, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent {

    private state: TicketInputTypeComponentState;

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.types.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.TYPE_ID, t.ID), t.Name)
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
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<number>(this.state.field.property, item ? Number(item.id) : null);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = TicketInputTypeComponent;
