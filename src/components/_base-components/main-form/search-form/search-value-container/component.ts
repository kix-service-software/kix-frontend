import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormInputRegistry, FormService, LabelService,
    SearchOperatorUtil,
    IKIXObjectSearchListener
} from '@kix/core/dist/browser';
import {
    TreeNode, SearchFormInstance, FilterCriteria, KIXObject, FilterType, FilterDataType
} from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormSearchValue } from './FormSearchValue';

class Component implements IKIXObjectSearchListener {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.formId = input.formId;
        this.state.objectType = input.objectType;
        this.state.defaultProperties = input.defaultProperties;
    }

    public onMount(): void {
        KIXObjectSearchService.getInstance().registerListener(this);

        const properties = KIXObjectSearchService.getInstance().getSearchProperties(this.state.objectType);
        if (properties) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.state.objectType);
            this.state.propertyNodes = properties.map((p) => new TreeNode(p, labelProvider.getPropertyText(p)));
        }

        if (this.state.defaultProperties) {
            this.setDefaultFormProperties();
            this.checkSearchValueList();
        }

        this.state.loading = false;
    }

    public propertyChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        if (nodes && nodes.length && nodes[0].id) {
            this.removeValue(searchValue, false);
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(
                this.state.objectType, nodes[0].id
            );
            searchValue.operationNodes = operations.map((o) => new TreeNode(o, SearchOperatorUtil.getText(o)));
            searchValue.currentOperationNode = null;
            searchValue.currentPropertyNode = nodes[0];
            this.provideFilterCriteria(searchValue);
            this.checkSearchValueList();
            (this as any).setStateDirty('searchValues');
        }
    }

    public operationChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        if (nodes && nodes.length) {
            searchValue.filterCriteria.operator = nodes[0].id;
            searchValue.currentOperationNode = nodes[0];
        }
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
            const index = this.state.searchValues.findIndex((sv) => sv.id === searchValue.id);
            this.state.searchValues.splice(index, 1);
            this.state.searchValues = [...this.state.searchValues];
            this.checkSearchValueList();
        }
    }

    private checkSearchValueList(): void {
        if (!this.state.searchValues.some((sv) => sv.currentPropertyNode === null)) {
            this.state.searchValues = [...this.state.searchValues, new FormSearchValue()];
        }
    }

    private setDefaultFormProperties(): void {
        this.state.defaultProperties.forEach((dp) => {
            const property = this.state.propertyNodes.find((pn) => pn.id === dp);
            const operations = KIXObjectSearchService.getInstance().getSearchOperations(
                this.state.objectType, dp
            );

            let currentOperation: TreeNode;
            if ((operations && operations.length)) {
                currentOperation = new TreeNode(operations[0], SearchOperatorUtil.getText(operations[0]));
            }

            const value = new FormSearchValue(
                dp,
                true,
                operations.map((o) => new TreeNode(o, SearchOperatorUtil.getText(o))),
                property,
                currentOperation
            );
            this.state.searchValues.push(value);

            const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
            const criteria = new FilterCriteria(dp, currentOperation.id, FilterDataType.STRING, FilterType.AND, null);
            formInstance.setFilterCriteria(criteria);
        });
    }

    public searchCriteriasChanged(criterias: FilterCriteria[]): void {
        return;
    }

    public searchCleared(): void {
        this.state.searchValues = [];
        this.checkSearchValueList();
    }

    public searchFinished<T extends KIXObject = KIXObject>(result: T[]): void {
        return;
    }

}

module.exports = Component;
