import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormInputRegistry, FormService, LabelService,
    SearchOperatorUtil,
    IKIXObjectSearchListener,
    IdService
} from '@kix/core/dist/browser';
import {
    TreeNode, SearchFormInstance, FilterCriteria, KIXObject, FilterType, FilterDataType
} from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormSearchValue } from './FormSearchValue';

class Component implements IKIXObjectSearchListener {

    private state: ComponentState;
    public listenerId: string = IdService.generateDateBasedId('search-value-container-');;

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
            this.state.propertyNodes = properties.map(
                (p) => new TreeNode(p, labelProvider ? labelProvider.getPropertyText(p) : p)
            );
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
            searchValue.setPropertyNode(nodes[0]);
            this.provideFilterCriteria(searchValue);
            this.checkSearchValueList();
            (this as any).setStateDirty('searchValues');
        }
    }

    public operationChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        if (nodes && nodes.length) {
            searchValue.setOperationNode(nodes[0]);
            this.provideFilterCriteria(searchValue);
        }
    }

    public treeValueChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        searchValue.setTreeValues(nodes);
        this.provideFilterCriteria(searchValue);
    }

    public textValueChanged(searchValue: FormSearchValue, event: any): void {
        const value = event.target.value;
        searchValue.setTextValue(value);
        this.provideFilterCriteria(searchValue);
    }

    public provideFilterCriteria(searchValue: FormSearchValue): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        formInstance.setFilterCriteria(searchValue.getFilterCriteria());
        (this as any).setStateDirty();
    }

    public removeValue(searchValue: FormSearchValue, removeFromForm: boolean = true): void {
        const formInstance = FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        formInstance.removeFilterCriteria(searchValue.getFilterCriteria());
        if (removeFromForm) {
            const index = this.state.searchValues.findIndex((sv) => sv.id === searchValue.id);
            this.state.searchValues.splice(index, 1);
            this.state.searchValues = [...this.state.searchValues];
            this.checkSearchValueList();
        }
    }

    private checkSearchValueList(): void {
        if (!this.state.searchValues.some((sv) => sv.currentPropertyNode === null)) {
            this.state.searchValues = [...this.state.searchValues, new FormSearchValue(this.state.objectType)];
        }
    }

    private setDefaultFormProperties(): void {
        this.state.defaultProperties.forEach((dp) => {
            const property = this.state.propertyNodes.find((pn) => pn.id === dp);
            if (property) {
                const searchValue = new FormSearchValue(this.state.objectType);
                searchValue.setPropertyNode(property);
                this.state.searchValues.push(searchValue);
                this.provideFilterCriteria(searchValue);
            }
        });
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
