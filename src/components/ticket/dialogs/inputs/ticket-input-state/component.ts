import { TicketInputStateComponentState } from "./TicketInputStateComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { PendingTimeFormValue } from "@kix/core/dist/browser/ticket";

class TicketInputStateComponent {

    private state: TicketInputStateComponentState;

    public onCreate(): void {
        this.state = new TicketInputStateComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.states.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.STATE_ID, t.ID), t.Name)
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
        this.state.pending = false;
        this.state.currentItem = item;

        if (item) {
            const objectData = ContextService.getInstance().getObjectData();
            const state = objectData.states.find((s) => s.ID === item.id);
            if (state) {
                const stateType = objectData.stateTypes.find((t) => t.ID === state.TypeID);
                this.state.pending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }

        this.provideValue();
    }

    private dateChanged(event: any): void {
        this.state.selectedDate = event.target.value;
        this.provideValue();
    }

    private timeChanged(event: any): void {
        this.state.selectedTime = event.target.value;
        this.provideValue();
    }

    private provideValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const stateValue = new PendingTimeFormValue(
            (this.state.currentItem ? Number(this.state.currentItem.id) : null),
            this.state.pending,
            new Date(`${this.state.selectedDate} ${this.state.selectedTime}`)
        );

        formInstance.provideFormFieldValue(this.state.field.property, stateValue);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.invalid = !fieldValue.valid;
    }
}

module.exports = TicketInputStateComponent;
