/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { FormInputComponent } from "../../../../../modules/base-components/webapp/core/FormInputComponent";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { TreeNode } from "../../../../base-components/webapp/core/tree";
import { TicketService, TicketStateOptions } from "../../core";
import { TicketProperty } from "../../../model/TicketProperty";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { FormFieldConfiguration } from "../../../../../model/configuration/FormFieldConfiguration";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { TicketState } from "../../../model/TicketState";
import { StateType } from "../../../model/StateType";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
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
    }

    public async load(): Promise<TreeNode[]> {
        const nodes = await TicketService.getInstance().getTreeNodes(TicketProperty.STATE_ID);
        for (const n of nodes) {
            n.tooltip = await TranslationService.translate(n.tooltip);
        }
        await this.setCurrentNode(nodes);
        return nodes;
    }

    protected async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = formInstance.getFormFieldValue<number>(this.state.field.instanceId);
        if (defaultValue && defaultValue.value) {
            let defaultStateValue;
            if (Array.isArray(defaultValue.value)) {
                defaultStateValue = defaultValue.value[0];
            } else {
                defaultStateValue = defaultValue.value;
            }
            if (defaultStateValue) {
                const currentNode = nodes.find((n) => n.id === defaultStateValue);
                currentNode.selected = true;
                await this.showPendingTime(currentNode);
                this.setValue(currentNode);
            }
        }
    }

    public stateChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        this.showPendingTime(currentNode);
        this.setValue(currentNode);
    }

    private async showPendingTime(currentNode: TreeNode): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let field = this.state.field.children.find((f) => f.property === TicketProperty.PENDING_TIME);
        const showPendingTime = await this.showPendingTimeField(currentNode);
        if (field && !showPendingTime) {
            formInstance.removeFormField(field, this.state.field);
        } else if (!field && showPendingTime) {
            const label = await LabelService.getInstance().getPropertyText(
                TicketProperty.PENDING_TIME, KIXObjectType.TICKET
            );
            field = new FormFieldConfiguration(
                'pending-time-field',
                label, TicketProperty.PENDING_TIME, 'ticket-input-state-pending', true,
                null, null, undefined, undefined, undefined, undefined, undefined, undefined,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                undefined, null, false
            );
            formInstance.addNewFormField(this.state.field, [field]);
        }
    }

    private async showPendingTimeField(currentNode: TreeNode): Promise<boolean> {
        let showPending = false;
        if (currentNode && this.checkPendingOption()) {
            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );
            const state = states.find((s) => s.ID === currentNode.id);
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

    private setValue(currentNode: TreeNode): void {
        super.provideValue(currentNode ? Number(currentNode.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
