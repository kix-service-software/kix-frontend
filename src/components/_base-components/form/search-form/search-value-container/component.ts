import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormService, LabelService, IKIXObjectSearchListener, IdService
} from '@kix/core/dist/browser';
import {
    TreeNode, SearchFormInstance
} from '@kix/core/dist/model';
import { FormSearchValue } from './FormSearchValue';

class Component implements IKIXObjectSearchListener {

    private state: ComponentState;
    public listenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-value-container-');
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

        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache && (!cache.isFulltext || !cache.fulltextValue)) {
            cache.criteria.forEach((criteria) => {
                const property = this.state.propertyNodes.find((pn) => pn.id === criteria.property);

                const searchValue = new FormSearchValue(this.state.objectType);
                searchValue.setPropertyNode(property);
                searchValue.setOperationNode(null, criteria.operator);
                searchValue.setCurrentValue(criteria.value);
                this.state.searchValues.push(searchValue);
                this.provideFilterCriteria(searchValue);
            });
        } else if (this.state.defaultProperties) {
            this.setDefaultFormProperties();
        }

        this.checkSearchValueList();
        this.state.loading = false;
    }

    public propertyChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        this.removeValue(searchValue, false);
        searchValue.setPropertyNode(nodes && nodes.length ? nodes[0] : null);
        this.provideFilterCriteria(searchValue);
        this.checkSearchValueList();
        (this as any).setStateDirty('searchValues');
    }

    public operationChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        searchValue.setOperationNode(nodes && nodes.length ? nodes[0] : null);
        this.provideFilterCriteria(searchValue);
    }

    public treeValueChanged(searchValue: FormSearchValue, nodes: TreeNode[]): void {
        searchValue.setTreeValues(nodes);
        this.provideFilterCriteria(searchValue);
    }

    public textValueChanged(searchValue: FormSearchValue, event: any): void {
        setTimeout(() => {
            const value = event.target.value;
            searchValue.setTextValue(value);
            this.provideFilterCriteria(searchValue);
        }, 100);
    }

    public dateValueChanged(searchValue: FormSearchValue, event: any): void {
        const value = event.target.value;
        searchValue.setDateValue(value);
        this.provideFilterCriteria(searchValue);
    }

    public timeValueChanged(searchValue: FormSearchValue, event: any): void {
        const value = event.target.value;
        searchValue.setTimeValue(value);
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
        this.setDefaultFormProperties();
        this.checkSearchValueList();
    }

    public searchFinished(): void {
        return;
    }

    public searchResultCategoryChanged(): void {
        return;
    }

}

module.exports = Component;
