import { ComponentState } from './ComponentState';
import { KIXObjectSearchService } from '@kix/core/dist/browser';
import { TreeNode } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.formId = input.formId;
        this.state.objectType = input.objectType;
    }

    public onMount(): void {
        const properties = KIXObjectSearchService.getInstance().getSearchProperties(this.state.objectType);
        if (properties) {
            this.state.propertyNodes = properties.map((p) => new TreeNode(p, p));
        }
    }

    public propertyChanged(node: TreeNode): void {
        if (node && node.id) {
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(this.state.objectType, node.id);
            this.state.operationNodes = operations.map((o) => new TreeNode(o, o));
            this.state.currentPropertyNode = node;
        }
    }

    public operationChanged(node: TreeNode): void {
        this.state.currentOperationNode = node;
    }

}

module.exports = Component;
