import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { TreeUtil, ObjectIcon, TicketProperty, TreeNode, Queue, FormInputComponent } from "@kix/core/dist/model";
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
        this.state.nodes = this.prepareTree(objectData.queuesHierarchy);
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue<number>(this.state.field.property);
            if (value) {
                this.state.currentNode = TreeUtil.findNode(this.state.nodes, value.value);
            }
        }
    }

    private prepareTree(queues: Queue[]): TreeNode[] {
        let nodes = [];
        if (queues) {
            nodes = queues.map((queue: Queue) => {
                const treeNode = new TreeNode(
                    queue.QueueID, queue.Name,
                    new ObjectIcon(TicketProperty.QUEUE_ID, queue.QueueID),
                    null,
                    this.prepareTree(queue.SubQueues)
                );
                return treeNode;
            });
        }
        return nodes;
    }

    public queueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

}

module.exports = Component;
