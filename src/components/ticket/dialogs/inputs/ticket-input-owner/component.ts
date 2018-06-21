import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, FormInputComponent, TreeNode } from "@kix/core/dist/model";
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
        this.state.nodes = objectData.agents.map((a) => new TreeNode(a.UserID, a.UserFullname, 'kix-icon-man'));
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentNode = this.state.nodes.find((i) => i.id === value.value);
            }
        }
    }

    public ownerChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }

}

module.exports = Component;
