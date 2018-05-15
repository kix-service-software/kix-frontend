import { TicketInputPriorityComponentState } from "./TicketInputPriorityComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputPriorityComponent extends FormInputComponent<number, TicketInputPriorityComponentState> {

    public onCreate(): void {
        this.state = new TicketInputPriorityComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.priorities.map((p) =>
            new FormDropdownItem(p.ID, new ObjectIcon(TicketProperty.PRIORITY_ID, p.ID), p.Name)
        );
    }

    public setCurrentValue(): void {
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
        super.provideValue(item ? Number(item.id) : null);
    }

}

module.exports = TicketInputPriorityComponent;
