import { TicketInputStateComponentState } from "./TicketInputStateComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { PendingTimeFormValue, TicketStateOptions } from "@kix/core/dist/browser/ticket";
import { FormInputComponent } from '@kix/core/dist/model/components/form/FormInputComponent';

class TicketInputStateComponent extends FormInputComponent<PendingTimeFormValue, TicketInputStateComponentState> {

    public onCreate(): void {
        this.state = new TicketInputStateComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.states.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.STATE_ID, t.ID), t.Name)
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<PendingTimeFormValue>(this.state.field.property);
            if (value && value.value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value.stateId);
            }
        }
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.pending = false;
        this.state.currentItem = item;

        if (item && this.showPendingTime()) {
            const objectData = ContextService.getInstance().getObjectData();
            const state = objectData.states.find((s) => s.ID === item.id);
            if (state) {
                const stateType = objectData.stateTypes.find((t) => t.ID === state.TypeID);
                this.state.pending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }

        this.setValue();
    }

    private showPendingTime(): boolean {
        if (this.state.field.options) {
            const pendingOption = this.state.field.options.find(
                (o) => o.option === TicketStateOptions.SHOW_PENDING_TIME
            );
            if (pendingOption && pendingOption.value === false) {
                return false;
            }
        }
        return true;
    }

    private dateChanged(event: any): void {
        this.state.selectedDate = event.target.value;
        this.setValue();
    }

    private timeChanged(event: any): void {
        this.state.selectedTime = event.target.value;
        this.setValue();
    }

    private setValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const stateValue = new PendingTimeFormValue(
            (this.state.currentItem ? Number(this.state.currentItem.id) : null),
            this.state.pending,
            new Date(`${this.state.selectedDate} ${this.state.selectedTime}`)
        );

        super.provideValue(stateValue);
    }
}

module.exports = TicketInputStateComponent;
