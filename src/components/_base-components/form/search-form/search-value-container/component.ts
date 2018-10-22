import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormService, LabelService, IKIXObjectSearchListener, IdService, SearchProperty
} from '@kix/core/dist/browser';
import { TreeNode, SearchFormInstance, CacheState, ISearchFormListener } from '@kix/core/dist/model';
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

    public async onMount(): Promise<void> {
        KIXObjectSearchService.getInstance().registerListener(this);

        const properties = KIXObjectSearchService.getInstance().getSearchProperties(this.state.objectType);
        if (properties) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.state.objectType);
            const nodes = [];
            for (const p of properties) {
                nodes.push(new TreeNode(p, labelProvider ? await labelProvider.getPropertyText(p) : p));
            }
            this.state.propertyNodes = nodes;
        }

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            if (formInstance.form.fulltextSearch) {
                this.state.propertyNodes = [
                    new TreeNode(SearchProperty.FULLTEXT, 'Volltext'),
                    ...this.state.propertyNodes
                ];
            }

            await this.initSearchForm();

            const listener: ISearchFormListener = {
                listenerId: 'search-form-value-container',
                searchCriteriaChanged: () => { return; },
                formReseted: () => { this.initSearchForm(); }
            };
            formInstance.registerSearchFormListener(listener);
        }


        this.state.loading = false;
    }

    private async initSearchForm(): Promise<void> {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        this.state.searchValues = [];
        if (cache && cache.status === CacheState.VALID) {
            for (const criteria of cache.criteria) {
                const property = this.state.propertyNodes.find((pn) => pn.id === criteria.property);

                const searchValue = new FormSearchValue(this.state.objectType);
                await searchValue.setPropertyNode(property);
                searchValue.setOperationNode(null, criteria.operator);
                searchValue.setCurrentValue(criteria.value);
                this.state.searchValues.push(searchValue);
                await this.provideFilterCriteria(searchValue);
            }
        } else if (this.state.defaultProperties) {
            await this.setDefaultFormProperties();
        }

        this.checkSearchValueList();
    }

    public async propertyChanged(searchValue: FormSearchValue, nodes: TreeNode[]): Promise<void> {
        await this.removeValue(searchValue, false);
        await searchValue.setPropertyNode(nodes && nodes.length ? nodes[0] : null);
        await this.provideFilterCriteria(searchValue);
        this.checkSearchValueList();
        (this as any).setStateDirty('searchValues');
    }

    public async operationChanged(searchValue: FormSearchValue, nodes: TreeNode[]): Promise<void> {
        searchValue.setOperationNode(nodes && nodes.length ? nodes[0] : null);
        await this.provideFilterCriteria(searchValue);
    }

    public async treeValueChanged(searchValue: FormSearchValue, nodes: TreeNode[]): Promise<void> {
        searchValue.setTreeValues(nodes);
        await this.provideFilterCriteria(searchValue);
    }

    public textValueChanged(searchValue: FormSearchValue, event: any): void {
        setTimeout(async () => {
            const value = event.target.value;
            searchValue.setTextValue(value);
            await this.provideFilterCriteria(searchValue);
        }, 100);
    }

    public async dateValueChanged(searchValue: FormSearchValue, event: any): Promise<void> {
        const value = event.target.value;
        searchValue.setDateValue(value);
        await this.provideFilterCriteria(searchValue);
    }

    public async timeValueChanged(searchValue: FormSearchValue, event: any): Promise<void> {
        const value = event.target.value;
        searchValue.setTimeValue(value);
        await this.provideFilterCriteria(searchValue);
    }

    public async provideFilterCriteria(searchValue: FormSearchValue): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        formInstance.setFilterCriteria(searchValue.getFilterCriteria());
        (this as any).setStateDirty();
    }

    public async removeValue(searchValue: FormSearchValue, removeFromForm: boolean = true): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
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

    private async setDefaultFormProperties(): Promise<void> {
        for (const defaultProp of this.state.defaultProperties) {
            const property = this.state.propertyNodes.find((pn) => pn.id === defaultProp);
            if (property) {
                const searchValue = new FormSearchValue(this.state.objectType);
                await searchValue.setPropertyNode(property);
                this.state.searchValues.push(searchValue);
                await this.provideFilterCriteria(searchValue);
            }
        }
    }

    public async searchCleared(): Promise<void> {
        this.state.searchValues = [];
        await this.setDefaultFormProperties();
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
