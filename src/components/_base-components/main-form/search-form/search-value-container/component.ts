import { ComponentState } from './ComponentState';
import { KIXObjectSearchService, FormInputRegistry, FormService, SearchOperator } from '@kix/core/dist/browser';
import { TreeNode, SearchFormInstance } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormSearchValue } from './FormSearchValue';

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

    public propertyChanged(searchValue: FormSearchValue, node: TreeNode): void {
        if (node && node.id) {
            this.removeValue(searchValue, false);
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(this.state.objectType, node.id);
            searchValue.operationNodes = operations.map((o) => new TreeNode(o, o));
            searchValue.currentOperationNode = null;
            searchValue.currentPropertyNode = node;
            this.provideFilterCriteria(searchValue);
            this.checkSearchValueList();
            (this as any).setStateDirty('searchValues');
        }
    }

    public operationChanged(searchValue: FormSearchValue, node: TreeNode): void {
        searchValue.filterCriteria.operator = node.id;
        searchValue.currentOperationNode = node;
    }

    public getPropertyComponent(searchValue: FormSearchValue): any {
        if (searchValue.currentPropertyNode) {
            const definition = FormInputRegistry.getInstance().getFormInputComponent(
                searchValue.currentPropertyNode.id, this.state.objectType
            );
            return ComponentsService.getInstance().getComponentTemplate(definition.componentId);
        }
    }

    public provideFilterCriteria(searchValue: FormSearchValue): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);

        searchValue.filterCriteria.property = searchValue.currentPropertyNode
            ? searchValue.currentPropertyNode.id
            : null;

        searchValue.filterCriteria.operator = searchValue.currentOperationNode
            ? searchValue.currentOperationNode.id
            : null;

        formInstance.setFilterCriteria(searchValue.filterCriteria);
    }

    public removeValue(searchValue: FormSearchValue, removeFromForm: boolean = true): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        formInstance.removeFilterCriteria(searchValue.filterCriteria);
        if (removeFromForm) {
            const index = this.state.searchValues.findIndex((sv) => {
                const removeId = searchValue.currentPropertyNode ? searchValue.currentPropertyNode.id : null;
                const propId = sv.currentPropertyNode ? sv.currentPropertyNode.id : null;
                return propId === removeId;
            });
            this.state.searchValues.splice(index, 1);
            this.state.searchValues = [...this.state.searchValues];
            this.checkSearchValueList();
        }
    }

    public checkSearchValueList(): void {
        if (!this.state.searchValues.some((sv) => sv.currentPropertyNode === null)) {
            this.state.searchValues = [...this.state.searchValues, new FormSearchValue()];
        }
    }

}

module.exports = Component;
