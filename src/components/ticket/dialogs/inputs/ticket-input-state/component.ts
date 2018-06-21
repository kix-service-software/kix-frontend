import { TicketInputStateComponentState } from "./TicketInputStateComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, ObjectIcon, TicketProperty, } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { PendingTimeFormValue, TicketStateOptions } from "@kix/core/dist/browser/ticket";
import { FormInputComponent } from '@kix/core/dist/model/components/form/FormInputComponent';

class TicketInputStateComponent extends FormInputComponent<PendingTimeFormValue, TicketInputStateComponentState> {

    public onCreate(): void {
        this.state = new TicketInputStateComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.ticketStates.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.STATE_ID, t.ID), t.Name)
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<PendingTimeFormValue>(this.state.field.property);
            if (value && value.value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value.stateId);
            }
        }
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.pending = false;
        this.state.currentItem = item;

        if (item && this.showPendingTime()) {
            const objectData = ContextService.getInstance().getObjectData();
            const state = objectData.ticketStates.find((s) => s.ID === item.id);
            if (state) {
                const stateType = objectData.ticketStateTypes.find((t) => t.ID === state.TypeID);
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
        if (this.state.currentItem) {
            const stateValue = new PendingTimeFormValue(
                (this.state.currentItem ? Number(this.state.currentItem.id) : null),
                this.state.pending,
                new Date(`${this.state.selectedDate} ${this.state.selectedTime}`)
            );
            super.provideValue(stateValue);
        } else {
            super.provideValue(null);
        }
    }
}

module.exports = TicketInputStateComponent;
