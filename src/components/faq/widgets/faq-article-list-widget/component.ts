import { ComponentState } from "./ComponentState";
import {
    ContextService, ActionFactory, StandardTableFactoryService,
    TableConfiguration, TableHeaderHeight, TableRowHeight, SearchOperator, WidgetService
} from "@kix/core/dist/browser";
import { KIXObjectType, KIXObjectPropertyFilter, TableFilterCriteria } from "@kix/core/dist/model";
import { FAQArticleProperty } from "@kix/core/dist/model/kix/faq";

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.prepareFilter();
        this.prepareActions();
        this.prepareTable();

        this.state.loading = false;
    }

    private prepareFilter(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.predefinedTableFilter = objectData.languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[1], [new TableFilterCriteria(FAQArticleProperty.LANGUAGE, SearchOperator.EQUALS, l[0])]
            )
        );
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private prepareTable(): void {
        const tableConfiguration = new TableConfiguration(
            null, 25, null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );

        const table =
            StandardTableFactoryService.getInstance().createStandardTable(
                KIXObjectType.FAQ_ARTICLE, tableConfiguration, null, null, true
            );

        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        table.setTableListener(() => {
            this.state.title = this.getTitle();
        });

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.state.table = table;
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private getTitle(): string {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : "";
        if (this.state.table) {
            title = `${title} (${this.state.table.getTableRows(true).length})`;
        }
        return title;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        this.state.table.setFilterSettings(textFilterValue, filter);
    }

}

module.exports = Component;
