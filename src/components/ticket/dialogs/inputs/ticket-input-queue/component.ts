import { TicketInputQueueComponentState } from "./TicketInputQueueComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TreeUtil, FormDropdownItem, ObjectIcon, TicketProperty, TreeNode, Queue,
    FormInputComponentState, FormFieldValue, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent extends FormInputComponent<number, TicketInputQueueComponentState> {

    public onCreate(): void {
        this.state = new TicketInputQueueComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.queuesHierarchy);
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

    private queueChanged(node: TreeNode): void {
        this.state.currentNode = node;
        super.provideValue(node ? node.id : null);
    }

}

module.exports = TicketInputTypeComponent;
