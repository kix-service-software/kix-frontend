import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponent, TreeNode
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<number, ComponentState>  {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.nodes = objectData.slas.map((s) =>
                new TreeNode(s.ID, s.Name, new ObjectIcon(TicketProperty.SLA_ID, s.ID))
            );
        }
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentNode = this.state.nodes.find((i) => i.id === value.value);
            }
        }
    }

    public slaChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
