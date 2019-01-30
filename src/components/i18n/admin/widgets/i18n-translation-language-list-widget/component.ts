import { ComponentState } from "./ComponentState";
import { TranslationDetailsContext } from "../../../../../core/browser/i18n/admin/context";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import {
    KIXObjectPropertyFilter, TableFilterCriteria, KIXObjectType, TranslationLanguageProperty, KIXObject, Translation
} from "../../../../../core/model";
import {
    ContextService, ServiceRegistry, WidgetService, SearchOperator, ActionFactory, TableConfiguration,
    TableHeaderHeight, TableRowHeight, StandardTableFactoryService
} from "../../../../../core/browser";
import { TranslationLabelProvider } from "../../../../../core/browser/i18n";

class Component {

    private state: ComponentState;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: TableFilterCriteria[] = [];

    public labelProvider: TranslationLabelProvider;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new TranslationLabelProvider();
        this.additionalFilterCriteria = [];
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );

        this.state.translation = await context.getObject<Translation>(KIXObjectType.TRANSLATION);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.prepareFilter();
        this.prepareActions();
        await this.prepareTable();
        this.setTitle();
        this.state.loading = false;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async prepareFilter(): Promise<void> {
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );
        const languages = await translationService.getLanguages();
        this.state.predefinedTableFilter = languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[0], [
                    new TableFilterCriteria(TranslationLanguageProperty.LANGUAGE, SearchOperator.EQUALS, l[0])
                ]
            )
        );
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private async prepareTable(): Promise<void> {
        const tableConfiguration = new TableConfiguration(
            null, null, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.TRANSLATION_LANGUAGE, tableConfiguration, null, null, true
        );

        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        if (this.state.translation) {
            table.layerConfiguration.contentLayer.setPreloadedObjects(this.state.translation.Languages);
        }

        await table.loadRows();

        this.state.table = table;

        this.state.table.setTableListener(() => {
            this.state.filterCount = this.state.table.getTableRows(true).length || 0;
            (this as any).setStateDirty('filterCount');
        });

        this.setTitle();
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setTitle(): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            const rows = this.state.table.getTableRows(true);
            title = `${title} (${rows.length})`;
        }
        this.state.title = title;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const name = this.predefinedFilter ? this.predefinedFilter.name : null;
            const predefinedCriteria = this.predefinedFilter ? this.predefinedFilter.criteria : [];
            const newFilter = new KIXObjectPropertyFilter(
                name, [...predefinedCriteria, ...this.additionalFilterCriteria]
            );

            this.state.table.setFilterSettings(textFilterValue, newFilter);

            const context = ContextService.getInstance().getActiveContext();
            const rows = this.state.table.getTableRows(true);
            context.setFilteredObjectList(rows.map((r) => r.object));
        }
    }
}

module.exports = Component;
