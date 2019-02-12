import {
    KIXObjectType, KIXObject, SearchFormInstance,
    InputFieldTypes, TreeNode, KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType
} from "../../../model";
import { StandardTable } from "../../standard-table";
import { SearchDefinition } from "./SearchDefinition";
import { SearchOperator } from "../../SearchOperator";
import { FormService } from "../../form";
import { KIXObjectSearchCache } from "./KIXObjectSearchCache";
import { IKIXObjectSearchListener } from "./IKIXObjectSearchListener";
import { SearchResultCategory } from "./SearchResultCategory";
import { KIXObjectService } from "../KIXObjectService";
import { ServiceRegistry } from "../ServiceRegistry";
import { SearchProperty } from "../../SearchProperty";

export class KIXObjectSearchService {

    private static INSTANCE: KIXObjectSearchService;

    public static getInstance(): KIXObjectSearchService {
        if (!KIXObjectSearchService.INSTANCE) {
            KIXObjectSearchService.INSTANCE = new KIXObjectSearchService();
        }

        return KIXObjectSearchService.INSTANCE;
    }

    private constructor() { }

    private searchCache: KIXObjectSearchCache<KIXObject>;
    private formSearches: Map<KIXObjectType, (formId: string) => Promise<any[]>> = new Map();
    private formTableConfigs: Map<KIXObjectType, StandardTable<any>> = new Map();
    private searchDefinitions: SearchDefinition[] = [];
    private activeSearchResultExplorerCategory: SearchResultCategory = null;

    private listeners: IKIXObjectSearchListener[] = [];

    public registerListener(listener: IKIXObjectSearchListener): void {
        const existingListenerIndex = this.listeners.findIndex((l) => l.listenerId === listener.listenerId);
        if (existingListenerIndex !== -1) {
            this.listeners.splice(existingListenerIndex, 1, listener);
        } else {
            this.listeners.push(listener);
        }
    }

    public registerFormSearch<T extends KIXObject>(
        objectType: KIXObjectType,
        search: (formId: string) => Promise<T[]>,
        tableConfig?: StandardTable<T>
    ): void {
        this.formSearches.set(objectType, search);
        if (tableConfig) {
            this.formTableConfigs.set(objectType, tableConfig);
        }
    }

    public async getInputComponentId(objectType: KIXObjectType, fieldId: string): Promise<string> {
        const definition = this.getSearchDefinition(objectType);
        let id;
        if (definition) {
            const components = await definition.getInputComponents();
            id = components.get(fieldId);
        }
        return id;
    }

    public getFormResultTable<T extends KIXObject>(objectType: KIXObjectType): StandardTable<T> {
        let tableConfig;
        if (this.formTableConfigs.has(objectType)) {
            tableConfig = this.formTableConfigs.get(objectType);
        }
        return tableConfig;
    }

    public async executeSearch<T extends KIXObject = KIXObject>(
        formId: string, excludeObjects?: KIXObject[]
    ): Promise<T[]> {
        let objects;
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        if (formInstance) {
            const objectType = formInstance.getObjectType();
            const searchDefinition = this.getSearchDefinition(objectType);

            if (formInstance instanceof SearchFormInstance) {
                const criteria = formInstance.getCriteria().filter((c) => c.value !== null && c.value !== undefined);

                const preparedCriteria = await searchDefinition.prepareFormFilterCriteria(criteria);
                const searchLoadingOptions = searchDefinition.getLoadingOptions(preparedCriteria);

                objects = await this.doSearch(formInstance.getObjectType(), searchLoadingOptions);
                this.searchCache = new KIXObjectSearchCache<T>(objectType, criteria, (objects as any));
                this.listeners.forEach((l) => l.searchFinished());
            } else {
                const formFieldValues = formInstance.getAllFormFieldValues();
                let criteria = [];

                const iterator = formFieldValues.keys();
                let key = iterator.next();
                while (key.value) {
                    const formFieldInstanceId = key.value;
                    const value = formFieldValues.get(formFieldInstanceId);

                    if (value.value && value.value !== '') {
                        const formField = await formInstance.getFormField(formFieldInstanceId);
                        if (formField) {
                            criteria = [
                                ...criteria,
                                ...searchDefinition.prepareSearchFormValue(formField.property, value.value)
                            ];
                        }
                    }

                    key = iterator.next();
                }

                if (excludeObjects && !!excludeObjects.length) {
                    criteria.push(new FilterCriteria(
                        excludeObjects[0].getIdPropertyName(),
                        SearchOperator.NOT_EQUALS,
                        FilterDataType.STRING,
                        FilterType.AND,
                        excludeObjects[0].ObjectId.toString()
                    ));
                }

                const loadingOptions = new KIXObjectLoadingOptions(null, criteria);
                objects = await this.doSearch(objectType, loadingOptions);
            }
        } else {
            throw new Error("No form found: " + formId);
        }

        return (objects as any);
    }

    private async doSearch(objectType: KIXObjectType, loadingOptions: KIXObjectLoadingOptions): Promise<KIXObject[]> {
        const objects = await KIXObjectService.loadObjects(objectType, null, loadingOptions, null, false);
        return objects;
    }

    public async executeFullTextSearch<T extends KIXObject>(
        objectType: KIXObjectType, searchValue: string
    ): Promise<T[]> {

        const searchDefinition = this.getSearchDefinition(objectType);
        const criteria = searchDefinition.prepareSearchFormValue(SearchProperty.FULLTEXT, searchValue);

        const loadingOptions = searchDefinition.getLoadingOptions(criteria);
        loadingOptions.searchValue = searchValue;

        const objects = await this.doSearch(objectType, loadingOptions);

        this.searchCache = new KIXObjectSearchCache<T>(objectType,
            [
                new FilterCriteria(
                    SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
                )
            ], (objects as T[]));

        this.searchCache.fulltextValue = searchValue;

        this.listeners.forEach((l) => l.searchFinished());

        return (objects as any);
    }

    public registerSearchDefinition(searchDefinition: SearchDefinition): void {
        this.searchDefinitions.push(searchDefinition);
    }

    public async getSearchProperties(
        objectType: KIXObjectType, parameter?: Array<[string, any]>
    ): Promise<Array<[string, string]>> {
        const searchDefinition = this.getSearchDefinition(objectType);
        let properties = [];
        if (searchDefinition) {
            properties = await searchDefinition.getProperties(parameter);
        }
        return properties;
    }

    public async getSearchOperations(
        objectType: KIXObjectType, property: string, parameter: Array<[string, any]>
    ): Promise<SearchOperator[]> {
        const searchDefinition = this.getSearchDefinition(objectType);
        let operations = [];
        if (searchDefinition) {
            operations = await searchDefinition.getOperations(property, parameter);
        }
        return operations;
    }

    public async getSearchInputType(
        objectType: KIXObjectType, property: string, parameter: Array<[string, any]>
    ): Promise<InputFieldTypes> {
        const searchDefinition = this.getSearchDefinition(objectType);
        let type = InputFieldTypes.TEXT;
        if (searchDefinition) {
            type = await searchDefinition.getInputFieldType(property, parameter);
        }
        return type;
    }

    public async getTreeNodes(
        objectType: KIXObjectType, property: string, parameter: Array<[string, any]>
    ): Promise<TreeNode[]> {
        const objectService = ServiceRegistry.getInstance().getServiceInstance<KIXObjectService>(objectType);
        let nodes = await objectService.getTreeNodes(property);
        if (!nodes || !nodes.length) {
            const searchDefinition = this.getSearchDefinition(objectType);
            nodes = await searchDefinition.getTreeNodes(property, parameter);
        }

        return nodes;
    }

    public getSearchCache(): KIXObjectSearchCache<KIXObject> {
        return this.searchCache;
    }

    public clearSearchCache(): void {
        this.searchCache = null;
        this.listeners.forEach((l) => l.searchCleared());
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory> {
        const searchDefinition = this.searchCache && this.searchCache.objectType ?
            this.searchDefinitions.find((sd) => sd.objectType === this.searchCache.objectType) : null;
        let categories;
        if (searchDefinition) {
            categories = await searchDefinition.getSearchResultCategories();
        }
        return categories;
    }

    public setActiveSearchResultExplorerCategory(category: SearchResultCategory): void {
        this.activeSearchResultExplorerCategory = category;
        this.listeners.forEach((l) => l.searchResultCategoryChanged(this.activeSearchResultExplorerCategory));
    }

    public getActiveSearchResultExplorerCategory(): SearchResultCategory {
        return this.activeSearchResultExplorerCategory;
    }

    public getSearchDefinition(objectType: KIXObjectType): SearchDefinition {
        return this.searchDefinitions.find((sd) => sd.objectType === objectType);
    }

}
