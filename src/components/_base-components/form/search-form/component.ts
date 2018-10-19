import {
    WidgetType, OverlayType, StringContent,
    KIXObject, SearchFormInstance, FilterCriteria, ISearchFormListener, CacheState
} from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import {
    WidgetService, DialogService, KIXObjectSearchService, OverlayService, ServiceRegistry,
    IdService, StandardTableFactoryService, TableConfiguration, TableHeaderHeight,
    TableRowHeight,
    IKIXObjectService,
    StandardTable,
    LabelService
} from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component implements ISearchFormListener {

    private state: ComponentState;
    public listenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('search-form-');
    }

    public onInput(input: any) {
        this.state.formId = input.formId;
        this.state.objectType = input.objectType;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('search-form-group', WidgetType.GROUP);

        this.state.table = this.createTable();

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            this.state.fulltextSearch = formInstance.form.fulltextSearch;
            this.state.fulltextActive = this.state.fulltextSearch;
            this.state.defaultProperties = formInstance.form.defaultSearchProperties;

            formInstance.registerSearchFormListener(this);
        }

        if (KIXObjectSearchService.getInstance().getSearchCache()) {
            const cache = KIXObjectSearchService.getInstance().getSearchCache();
            if (cache.status === CacheState.VALID && cache.objectType === this.state.objectType) {
                this.state.fulltextActive = cache.isFulltext;
                this.state.fulltextValue = cache.fulltextValue;
                await this.setSearchResult(cache.result);
                await this.setCanSearch();
            } else {
                this.reset();
            }
        }

        this.setFulltextGroupActive();
        this.state.loading = false;
    }

    public async onDestroy(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            formInstance.removeSearchFormListener(this.listenerId);
        }
    }

    public keyDown(event: any): void {
        if ((event.keyCode === 13 || event.key === 'Enter') && this.state.canSearch) {
            if (event.preventDefault) {
                event.preventDefault(event);
            }
            this.search();
        }
    }

    public async fulltextValueChanged(event: any): Promise<void> {
        this.state.fulltextValue = event.target.value;
        await this.setCanSearch();
    }

    public formReseted(): void {
        return;
    }

    public async reset(): Promise<void> {
        this.state.loading = true;
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            cache.status = CacheState.INVALID;
        }

        const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }

        this.state.fulltextValue = null;
        await this.setSearchResult([]);
        this.state.loading = false;
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async search(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true, "Suche ...", true);
        if (this.state.fulltextActive) {
            if (this.state.fulltextValue && this.state.fulltextValue !== '') {
                await KIXObjectSearchService.getInstance()
                    .executeFullTextSearch<KIXObject>(this.state.objectType, this.state.fulltextValue)
                    .then((objects) => {
                        this.setSearchResult(objects);
                    })
                    .catch((error) => {
                        this.showError(error);
                    });
            }
        } else {
            await KIXObjectSearchService.getInstance().executeSearch<KIXObject>(this.state.formId)
                .then((objects) => {
                    this.setSearchResult(objects);
                })
                .catch((error) => {
                    this.showError(error);
                });
        }
        DialogService.getInstance().setMainDialogLoading(false);
    }

    public submit(): void {
        if (this.state.resultCount) {
            DialogService.getInstance().closeMainDialog();
        }
    }

    public removeValue(): void {
        return;
    }

    private setFulltextGroupActive(): void {
        if (this.state.fulltextSearch) {
            const formElement = (this as any).getEl();
            if (formElement) {
                formElement.style.opacity = 0;
                setTimeout(() => {
                    this.handleSearchFormGroupMinimizeState('fulltext');
                    formElement.style.opacity = null;
                }, 50);
            }
        }
    }

    public async handleSearchFormGroupMinimizeState(groupName: string, minimized: boolean = false): Promise<void> {
        if (this.state.fulltextSearch) {
            if (minimized === false) {
                let otherGroupName;
                if (groupName === 'fulltext') {
                    this.state.fulltextActive = true;
                    otherGroupName = 'attributes';
                    const fulltextInput = (this as any).getEl('fulltext-input');
                    if (fulltextInput) {
                        fulltextInput.focus();
                    }
                } else {
                    this.state.fulltextActive = false;
                    otherGroupName = 'fulltext';
                }
                const groupComponent = (this as any).getComponent(otherGroupName);
                if (groupComponent) {
                    groupComponent.setMinizedState(true);
                }
                await this.setCanSearch();
            }
        }
    }

    public getAttributeSearchTitle(): string {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(this.state.objectType);
        let title = 'Attribute:';
        if (labelProvider) {
            const objectName = labelProvider.getObjectName();
            title = objectName ? `${objectName}-${title}` : title;
        }
        return title;
    }

    private async setSearchResult(objects: KIXObject[]): Promise<void> {
        this.state.table = null;

        const table = this.createTable();
        table.layerConfiguration.contentLayer.setPreloadedObjects(objects);
        table.tableConfiguration.routingConfiguration.externalLink = false;

        const objectService = ServiceRegistry.getInstance().getServiceInstance<IKIXObjectService>(
            this.state.objectType
        );
        const searchCache = KIXObjectSearchService.getInstance().getSearchCache();
        const objectProperties = searchCache ? searchCache.criteria.map((c) => c.property) : [];

        const columns = objectService.getTableColumnConfiguration(objectProperties);
        table.setColumns(columns);

        await table.loadRows();

        setTimeout(() => {
            this.state.resultCount = objects ? objects.length : 0;
            this.state.table = table;
        }, 100);
    }

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }

    private async setCanSearch(): Promise<void> {
        if (this.state.fulltextActive) {
            this.state.canSearch = !!this.state.fulltextValue;
        } else {
            const formInstance = await FormService.getInstance().getFormInstance<SearchFormInstance>(this.state.formId);
            if (formInstance) {
                this.state.canSearch = formInstance.getCriteria().some(
                    (c) => c.property !== null && c.operator !== null
                        && c.value !== null && c.value !== '' && !/^\s+$/.test(c.value.toString())
                );
            }
        }
    }

    public async searchCriteriaChanged(criteria: FilterCriteria[]): Promise<void> {
        await this.setCanSearch();
    }

    private createTable(): StandardTable {
        const tableConfiguration = new TableConfiguration(
            null, 5, null, null, false, false, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            this.state.objectType, tableConfiguration, null, null, true
        );
        return table;
    }
}

module.exports = Component;
