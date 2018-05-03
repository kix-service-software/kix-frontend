import { TicketInputQueueComponentState } from "./TicketInputQueueComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, TreeNode, Queue, FormInputComponentState, FormFieldValue
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent {

    private state: TicketInputQueueComponentState;

    public onCreate(): void {
        this.state = new TicketInputQueueComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.queuesHierarchy);
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
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, new FormFieldValue<number>(node.id));
    }

}

module.exports = TicketInputTypeComponent;
