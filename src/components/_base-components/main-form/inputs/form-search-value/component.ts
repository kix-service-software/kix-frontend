import { ComponentState } from './ComponentState';
import { KIXObjectSearchService, FormInputRegistry, FormService, SearchOperator } from '@kix/core/dist/browser';
import { TreeNode, FormField } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';

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
            const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
            formInstance.addSearchFormField(new FormField(node.id, node.id));
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(this.state.objectType, node.id);
            this.state.operationNodes = operations.map((o) => new TreeNode(o, o));
            this.state.currentPropertyNode = node;
        }
    }

    public getPropertyComponent(): any {
        if (this.state.currentPropertyNode) {
            const definition = FormInputRegistry.getInstance().getFormInputComponent(
                this.state.currentPropertyNode.id, this.state.objectType
            );
            return ComponentsService.getInstance().getComponentTemplate(definition.componentId);
        }
    }

    public operationChanged(node: TreeNode): void {
        this.state.currentOperationNode = node;
        if (node.id === SearchOperator.IN) {
            this.state.multiple = true;
        } else {
            this.state.multiple = false;
        }
    }

}

module.exports = Component;
