import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ObjectIcon, TicketProperty, TreeNode, Queue,
    FormInputComponent, FormContext, SearchFormInstance
} from "@kix/core/dist/model";
import { FormService, SearchOperator } from "@kix/core/dist/browser";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (this.state.formContext === FormContext.SEARCH) {
            const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
            formInstance.registerListener({
                formValueChanged: () => {
                    const criteria = formInstance.getCriterias().find((c) => c.property === this.state.fieldId);
                    if (criteria) {
                        this.state.multiselect = criteria.operator ? criteria.operator === SearchOperator.IN : false;
                    }
                },
                updateForm: () => { return; }
            });
        }
    }

    public onMount(): void {
        super.onMount();
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

    public queueChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes ? nodes : [];
        super.provideValue(
            this.state.currentNodes
                ? this.state.currentNodes.map((cn) => cn.id)
                : null
        );
    }

}

module.exports = Component;
