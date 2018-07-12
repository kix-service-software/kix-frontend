import { ComponentState } from './ComponentState';
import { KIXObjectPropertyFilter, KIXObject, } from '@kix/core/dist/model/';
import { ContextService } from "@kix/core/dist/browser/context";
import {
    ActionFactory, KIXObjectSearchService, IKIXObjectSearchListener,
    LabelService, SearchOperatorUtil, StandardTableFactoryService, WidgetService,
    TableConfiguration, TableHeaderHeight, TableRowHeight
} from '@kix/core/dist/browser';
import { KIXObjectServiceRegistry } from '@kix/core/dist/browser';

class Component implements IKIXObjectSearchListener {

    public listenerId: string;

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.listenerId = this.state.instanceId;
    }

    public onMount(): void {
        const currentContext = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = currentContext
            ? currentContext.getWidgetConfiguration(this.state.instanceId)
            : undefined;


        this.setActions();

        KIXObjectSearchService.getInstance().registerListener(this);
        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.searchFinished();
        }
    }

    public searchCleared(): void {
        this.state.criterias = [];
        this.state.resultTable = null;
    }

    public searchFinished<T extends KIXObject = KIXObject>(): void {
        this.state.resultTable = null;
        this.state.criterias = [];

        const cache = KIXObjectSearchService.getInstance().getSearchCache();
        if (cache) {
            this.state.noSearch = false;
            const labelProvider = LabelService.getInstance().getLabelProviderForType(cache.objectType);
            const cachedCriterias = (cache ? cache.criterias : []);
            const newCriterias: Array<[string, string, string]> = [];
            cachedCriterias.forEach(
                (cc) => {
                    const property = labelProvider.getPropertyText(cc.property);
                    const operator = SearchOperatorUtil.getText(cc.operator);
                    const value = cc.value.toString();
                    newCriterias.push([property, operator, value]);
                }
            );
            this.state.criterias = newCriterias;

            this.state.resultIcon = labelProvider.getObjectIcon();
            this.state.resultTitle = `Trefferliste: ${labelProvider.getObjectName(true)} (${cache.result.length})`;

            const objectService = KIXObjectServiceRegistry.getInstance().getServiceInstance(cache.objectType);

            const tableConfiguration = new TableConfiguration(
                null, 10, null, null, true, null, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            this.state.resultTable = StandardTableFactoryService.getInstance().createStandardTable(
                cache.objectType, tableConfiguration, null, null, true
            );

            const objectProperties = cache.criterias.map((c) => c.property);
            const columns = objectService.getTableColumnConfiguration(objectProperties);

            this.state.resultTable.setColumns(columns);
            this.state.resultTable.layerConfiguration.contentLayer.setPreloadedObjects(cache.result);
            this.state.resultTable.loadRows(false);
            this.state.resultTable.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

            WidgetService.getInstance().setActionData(this.state.instanceId, this.state.resultTable);
        } else {
            this.state.noSearch = true;
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().rerenderActions(this.state.instanceId);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.actions, true);
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.resultTable) {
            this.state.resultTable.setFilterSettings(textFilterValue, filter);
        }
    }
}

module.exports = Component;
