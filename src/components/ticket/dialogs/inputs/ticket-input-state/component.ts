import { ComponentState } from "./ComponentState";
import {
    TicketProperty, TreeNode, TicketState, KIXObjectType, StateType, FormField
} from "../../../../../core/model";
import { TicketStateOptions, TicketService } from "../../../../../core/browser/ticket";
import { FormInputComponent } from '../../../../../core/model/components/form/FormInputComponent';
import { KIXObjectService, FormService, LabelService } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<number, ComponentState> {

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
        this.showPendingTimeField();
    }

    protected setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let defaultStateValue;
            if (Array.isArray(this.state.defaultValue.value)) {
                defaultStateValue = this.state.defaultValue.value[0];
            } else {
                defaultStateValue = this.state.defaultValue.value;
            }
            if (defaultStateValue) {
                this.state.currentNode = this.state.nodes.find((n) => n.id === defaultStateValue);
                this.showPendingTime();
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
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let field = this.state.field.children.find((f) => f.property === TicketProperty.PENDING_TIME);
        const showPendingTime = await this.showPendingTimeField();
        if (field && !showPendingTime) {
            formInstance.removeFormField(field, this.state.field);
        } else if (!field && showPendingTime) {
            const label = await LabelService.getInstance().getPropertyText(
                TicketProperty.PENDING_TIME, KIXObjectType.TICKET
            );
            field = new FormField(
                label, TicketProperty.PENDING_TIME, 'ticket-input-state-pending', true,
                null, null, undefined, undefined, undefined, undefined, undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                undefined, false
            );
            formInstance.addNewFormField(this.state.field, [field]);
        }
    }

    private async showPendingTimeField(): Promise<boolean> {
        let showPending = false;
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
                showPending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }
        return showPending;
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

    private setValue(): void {
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
