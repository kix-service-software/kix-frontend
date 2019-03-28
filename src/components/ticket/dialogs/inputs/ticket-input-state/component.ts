import { ComponentState } from "./ComponentState";
import {
    TicketProperty, TreeNode, DateTimeUtil, TicketState, KIXObjectType, StateType
} from "../../../../../core/model";
import { PendingTimeFormValue, TicketStateOptions, TicketService } from "../../../../../core/browser/ticket";
import { FormInputComponent } from '../../../../../core/model/components/form/FormInputComponent';
import { KIXObjectService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<PendingTimeFormValue, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.nodes = await TicketService.getInstance().getTreeNodes(TicketProperty.STATE_ID);
        this.setCurrentNode();
        this.showPendingTime();
    }

    protected setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let defaultStateValue: PendingTimeFormValue;
            if (Array.isArray(this.state.defaultValue.value)) {
                defaultStateValue = this.state.defaultValue.value[0];
            } else {
                defaultStateValue = this.state.defaultValue.value;
            }
            if (defaultStateValue) {
                this.state.currentNode = this.state.nodes.find((n) => n.id === defaultStateValue.stateId);
                this.showPendingTime();
                if (this.state.pending && defaultStateValue.pendingDate) {
                    const pendingDate = new Date(defaultStateValue.pendingDate);
                    this.state.selectedDate = DateTimeUtil.getKIXDateString(pendingDate);
                    this.state.selectedTime = DateTimeUtil.getKIXTimeString(pendingDate);
                }
                this.setValue();
            }
        }
    }

    public stateChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;

        this.showPendingTime();
        this.setValue();
    }

    private async showPendingTime(): Promise<void> {
        this.state.pending = false;
        if (this.state.currentNode && this.checkPendingOption()) {
            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );
            const state = states.find((s) => s.ID === this.state.currentNode.id);
            if (state) {
                const stateType = stateTypes.find((t) => t.ID === state.TypeID);
                this.state.pending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }
    }

    private checkPendingOption(): boolean {
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
                Number(this.state.currentNode.id),
                this.state.pending,
                new Date(`${this.state.selectedDate} ${this.state.selectedTime}`)
            );
            super.provideValue(stateValue);
        } else {
            super.provideValue(null);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
