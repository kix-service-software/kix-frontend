import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { ObjectIcon, TicketProperty, FormInputComponent, TreeNode } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = objectData.ticketTypes.map((t) =>
            new TreeNode(t.ID, t.Name, new ObjectIcon(TicketProperty.TYPE_ID, t.ID))
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.currentNode = this.state.nodes.find((i) => i.id === fieldValue.value);
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
