import { TicketInputSLAComponentState } from "./TicketInputSLAComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputSLAComponent extends FormInputComponent<number, TicketInputSLAComponentState>  {

    public onCreate(): void {
        this.state = new TicketInputSLAComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.slas.map((s) =>
            new FormDropdownItem(s.ID, new ObjectIcon(TicketProperty.SLA_ID, s.ID), s.Name)
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value);
            }
        }
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        formInstance.provideFormFieldValue<number>(
            this.state.field.property, (item ? Number(item.id) : null)
        );
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }

}

module.exports = TicketInputSLAComponent;
