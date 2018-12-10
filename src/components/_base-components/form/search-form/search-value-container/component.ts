import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormService, LabelService, IKIXObjectSearchListener, IdService, DialogService
} from '@kix/core/dist/browser';
import { TreeNode, SearchFormInstance, CacheState, ISearchFormListener, KIXObjectType } from '@kix/core/dist/model';
import { FormSearchValue } from './FormSearchValue';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;

    private state: ComponentState;
    private objectType: KIXObjectType = null;
    private formId: string = null;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-value-container-');
    }

    public onInput(input: any): void {
        this.formId = input.formId;
        this.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        KIXObjectSearchService.getInstance().registerListener(this);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            const listener: ISearchFormListener = {
                listenerId: 'search-form-value-container',
                searchCriteriaChanged: () => { return; },
                formReseted: () => { this.initSearchForm(formInstance); }
            };
            formInstance.registerSearchFormListener(listener);

            const properties = await KIXObjectSearchService.getInstance().getSearchProperties(this.objectType);
            await this.createPropertyNodes(properties);
            await this.initSearchForm(formInstance);
        }
        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async initSearchForm(formInstance: SearchFormInstance): Promise<void> {
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        this.state.searchValues = [];
        if (cache && cache.status === CacheState.VALID && cache.objectType === this.objectType) {
            const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.objectType);
            for (const criteria of cache.criteria) {
                const property = this.state.propertyNodes.find((pn) => pn.id === criteria.property);

                const searchValue = new FormSearchValue(this.objectType, searchDefinition);
                const parameter = this.getSearchParameter(formInstance);
                await searchValue.setPropertyNode(property, parameter);
                searchValue.setOperationNode(null, criteria.operator);
                searchValue.setCurrentValue(criteria.value);
                this.state.searchValues.push(searchValue);
                await this.provideFilterCriteria(searchValue);
            }
        } else {
            await this.setDefaultFormProperties(formInstance);
        }

        await this.checkFormContent();
        this.addEmptySearchValue();
    }

    public async propertyChanged(searchValue: FormSearchValue, nodes: TreeNode[]): Promise<void> {
        await this.removeValue(searchValue, false);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        const parameter = this.getSearchParameter(formInstance);
        await searchValue.setPropertyNode(nodes && nodes.length ? nodes[0] : null, parameter);
        await this.provideFilterCriteria(searchValue);
        await this.checkFormContent();
        this.addEmptySearchValue();
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
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        formInstance.setFilterCriteria(searchValue.getFilterCriteria());
        await this.checkFormContent();
        (this as any).setStateDirty();
    }

    public async removeValue(searchValue: FormSearchValue, removeFromForm: boolean = true): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        formInstance.removeFilterCriteria(searchValue.getFilterCriteria());
        if (removeFromForm) {
            const index = this.state.searchValues.findIndex((sv) => sv.id === searchValue.id);
            this.state.searchValues.splice(index, 1);
            this.state.searchValues = [...this.state.searchValues];
            await this.checkFormContent();
        }
    }

    private async checkFormContent(): Promise<void> {
        const timeout = window.setTimeout(() => {
            DialogService.getInstance().setMainDialogLoading(true);
        }, 500);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            const searchParameter: Array<[string, any]> = this.getSearchParameter(formInstance);

            const properties = await KIXObjectSearchService.getInstance().getSearchProperties(
                this.objectType, searchParameter
            );

            this.state.searchValues.forEach((sv) => sv.setSearchParameter(searchParameter));

            this.updateSearchValues(properties.map((p) => p[0]));
            await this.createPropertyNodes(properties);
        }

        window.clearTimeout(timeout);
        DialogService.getInstance().setMainDialogLoading(false);
    }

    private async setDefaultFormProperties(formInstance: SearchFormInstance): Promise<void> {
        const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.objectType);
        const defaultProperties = formInstance.form.defaultSearchProperties;
        if (defaultProperties) {
            for (const defaultProp of defaultProperties) {
                const property = this.state.propertyNodes.find((pn) => pn.id === defaultProp);
                if (property) {
                    const searchValue = new FormSearchValue(this.objectType, searchDefinition);
                    const parameter = this.getSearchParameter(formInstance);
                    await searchValue.setPropertyNode(property, parameter);
                    searchValue.setSearchParameter(parameter);
                    this.state.searchValues.push(searchValue);
                    await this.provideFilterCriteria(searchValue);
                }
            }
        }
    }

    public async searchCleared(): Promise<void> {
        this.state.searchValues = [];
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        await this.setDefaultFormProperties(formInstance);
        await this.checkFormContent();
    }

    public searchFinished(): void {
        return;
    }

    public searchResultCategoryChanged(): void {
        return;
    }

    private async createPropertyNodes(properties: Array<[string, string]>): Promise<void> {
        if (properties) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
            const nodes = [];
            for (const p of properties) {
                let displayText = p[1];
                if (!displayText) {
                    displayText = await labelProvider.getPropertyText(p[0]);
                }
                nodes.push(new TreeNode(p[0], displayText || p[0]));
            }
            this.state.propertyNodes = nodes;
        }
    }

    private addEmptySearchValue(): void {
        if (!this.state.searchValues.some((sv) => sv.currentPropertyNode === null)) {
            const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.objectType);
            this.state.searchValues = [
                ...this.state.searchValues,
                new FormSearchValue(this.objectType, searchDefinition)
            ];
        }
    }

    private updateSearchValues(properties: string[]): void {
        const searchValuesToRemove = [];
        this.state.searchValues.filter((sv) => sv.currentPropertyNode).forEach((sv) => {
            if (!properties.some((p) => p === sv.currentPropertyNode.id)) {
                searchValuesToRemove.push(sv);
            }
        });
        searchValuesToRemove.forEach((sv) => this.removeValue(sv, true));
    }

    private getSearchParameter(formInstance: SearchFormInstance): Array<[string, any]> {
        const searchParameter: Array<[string, any]> = [];
        this.state.searchValues.filter((sv) => sv.currentPropertyNode).forEach((sv) => {
            const property = sv.currentPropertyNode.id;
            const value = formInstance.getFormFieldValue(property);
            searchParameter.push([property, value ? value.value : null]);
        });
        return searchParameter;
    }
}

module.exports = Component;
