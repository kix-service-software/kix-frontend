import { ComponentState } from './ComponentState';
import {
    KIXObjectSearchService, FormService, LabelService, IKIXObjectSearchListener, IdService
} from '../../../../../core/browser';
import {
    TreeNode, SearchFormInstance, CacheState, ISearchFormListener, KIXObjectType
} from '../../../../../core/model';
import { FormSearchValue } from './FormSearchValue';
import { DialogService } from '../../../../../core/browser/components/dialog';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;

    private state: ComponentState;
    private objectType: KIXObjectType = null;
    private formId: string = null;
    private initialPropertyNodes: TreeNode[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-value-container-');
    }

    public onInput(input: any): void {
        this.formId = input.formId;
        this.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Remove Search Criteria"
        ]);

        DialogService.getInstance().setMainDialogLoading(true);
        KIXObjectSearchService.getInstance().registerListener(this);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            const listener: ISearchFormListener = {
                listenerId: 'search-form-value-container',
                searchCriteriaChanged: () => { return; },
                formReseted: () => {
                    this.state.propertyNodes = [...this.initialPropertyNodes];
                    this.initSearchForm(formInstance);
                }
            };
            formInstance.registerSearchFormListener(listener);

            await this.createPropertyNodes();
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
        this.setAvailablePropertyNodes();
        this.addEmptySearchValue();
        (this as any).setStateDirty('searchValues');
    }

    private setAvailablePropertyNodes(): void {
        this.state.propertyNodes = this.initialPropertyNodes.filter(
            (pn) => !this.state.searchValues.some(
                (sv) => sv.currentPropertyNode && sv.currentPropertyNode.id === pn.id
            )
        );
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
        this.setAvailablePropertyNodes();
        this.addEmptySearchValue();
    }

    private async checkFormContent(): Promise<void> {
        const timeout = window.setTimeout(() => {
            DialogService.getInstance().setMainDialogLoading(true);
        }, 500);

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.formId);
        if (formInstance) {
            const searchParameter: Array<[string, any]> = this.getSearchParameter(formInstance);
            this.state.searchValues.forEach((sv) => sv.setSearchParameter(searchParameter));
            await this.createPropertyNodes(searchParameter);
            this.updateSearchValues();
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
                    this.setAvailablePropertyNodes();
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

    private async createPropertyNodes(searchParameter: Array<[string, any]> = []): Promise<void> {
        const properties = await KIXObjectSearchService.getInstance().getSearchProperties(
            this.objectType, searchParameter
        );
        if (properties && !!properties.length) {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(this.objectType);
            const nodes = [];
            for (const p of properties) {
                let displayText = p[1];
                if (!displayText) {
                    displayText = await labelProvider.getPropertyText(p[0]);
                }
                nodes.push(new TreeNode(p[0], displayText || p[0]));
            }
            this.initialPropertyNodes = nodes;
            this.state.propertyNodes = [...this.initialPropertyNodes];
        }
    }

    private addEmptySearchValue(): void {
        const index = this.state.searchValues.findIndex((sv) => sv.currentPropertyNode === null);
        let emptyField: FormSearchValue;
        if (index === -1) {
            const searchDefinition = KIXObjectSearchService.getInstance().getSearchDefinition(this.objectType);
            emptyField = new FormSearchValue(this.objectType, searchDefinition);
        } else {
            emptyField = this.state.searchValues.splice(index, 1)[0];
        }

        if (!!this.state.propertyNodes.length) {
            this.state.searchValues = [...this.state.searchValues, emptyField];
        }
    }

    private updateSearchValues(): void {
        const searchValuesToRemove = [];
        this.state.searchValues.filter((sv) => sv.currentPropertyNode).forEach((sv) => {
            if (!this.initialPropertyNodes.map((pn) => pn.id).some((p) => p === sv.currentPropertyNode.id)) {
                searchValuesToRemove.push(sv);
            }
        });
        searchValuesToRemove.forEach((sv) => this.removeValue(sv, true));
        this.setAvailablePropertyNodes();
        this.addEmptySearchValue();
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
