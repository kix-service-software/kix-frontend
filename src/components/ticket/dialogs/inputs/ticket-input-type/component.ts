import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, TreeNode, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent extends FormInputComponent<number, TicketInputTypeComponentState> {

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.types.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.TYPE_ID, t.ID), t.Name)
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.currentItem = this.state.items.find((i) => i.id === fieldValue.value);
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }

}

module.exports = TicketInputTypeComponent;
