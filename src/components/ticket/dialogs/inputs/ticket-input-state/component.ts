import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { ObjectIcon, TicketProperty, TreeNode, } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { PendingTimeFormValue, TicketStateOptions } from "@kix/core/dist/browser/ticket";
import { FormInputComponent } from '@kix/core/dist/model/components/form/FormInputComponent';

class Component extends FormInputComponent<PendingTimeFormValue, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = objectData.ticketStates.map((t) =>
            new TreeNode(t.ID, t.Name, new ObjectIcon(TicketProperty.STATE_ID, t.ID))
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<PendingTimeFormValue>(this.state.field.property);
            if (value && value.value) {
                this.state.currentNode = this.state.nodes.find((i) => i.id === value.value.stateId);
            }
        }
    }

    public stateChanged(nodes: TreeNode[]): void {
        this.state.pending = false;
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;

        if (this.state.currentNode && this.showPendingTime()) {
            const objectData = ContextService.getInstance().getObjectData();
            const state = objectData.ticketStates.find((s) => s.ID === this.state.currentNode.id);
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

    public dateChanged(event: any): void {
        this.state.selectedDate = event.target.value;
        this.setValue();
    }

    public timeChanged(event: any): void {
        this.state.selectedTime = event.target.value;
        this.setValue();
    }

    private setValue(): void {
        if (this.state.currentNode) {
            const stateValue = new PendingTimeFormValue(
                (this.state.currentNode ? Number(this.state.currentNode.id) : null),
                this.state.pending,
                new Date(`${this.state.selectedDate} ${this.state.selectedTime}`)
            );
            super.provideValue(stateValue);
        } else {
            super.provideValue(null);
        }
    }
}

module.exports = Component;
