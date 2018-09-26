import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ObjectIcon, TicketProperty, TreeNode, Queue, FormInputComponent, KIXObjectType
} from "@kix/core/dist/model";
import { KIXObjectService } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const queuesHierarchy = await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE_HIERARCHY, null
        );

        this.state.nodes = this.prepareTree(queuesHierarchy);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
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
