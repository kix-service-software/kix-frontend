import {
    AbstractMarkoComponent, WidgetService, ActionFactory,
    LabelService, ContextService, ServiceRegistry, SearchOperator, TableEvent, TableFactoryService, TableEventData
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectPropertyFilter, TranslationProperty, TableFilterCriteria
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const translationService = await ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );

        const languages = await translationService.getLanguages();

        const filterCriteria: KIXObjectPropertyFilter[] = [];
        languages.forEach((l) => {
            filterCriteria.push(
                new KIXObjectPropertyFilter(l[1], [
                    new TableFilterCriteria(TranslationProperty.LANGUAGES, SearchOperator.EQUALS, l[0], true)
                ])
            );
            filterCriteria.push(
                new KIXObjectPropertyFilter('not ' + l[1], [
                    new TableFilterCriteria(TranslationProperty.LANGUAGES, SearchOperator.NOT_EQUALS, l[0], true)
                ])
            );
        });

        this.state.predefinedTableFilter = filterCriteria;

        this.prepareActions();

        await this.prepareTitle();
        await this.prepareTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
    }

    private async prepareTitle(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TRANSLATION);
        const objectName = await labelProvider.getObjectName(true);
        const count = this.state.table ? this.state.table.getRows(true).length : 0;
        this.state.title = `${context.categoryName}: ${objectName} (${count})`;
    }

    private async prepareTable(): Promise<void> {
        const table = TableFactoryService.getInstance().createTable(
            'i18n-translations', KIXObjectType.TRANSLATION, null, null, null, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'i18n-admin-translations-table-listener',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.TABLE_READY || eventId === TableEvent.TABLE_INITIALIZED) {
                        this.state.filterCount = this.state.table.isFiltered()
                            ? this.state.table.getRows().length : null;
                        this.prepareTitle();
                    }

                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        this.state.table = table;
        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.tableSubscriber);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'i18n-admin-translation-create',
                'i18n-admin-translation-import',
                'i18n-admin-translation-csv-export'
            ], null
        );

        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
            this.state.table.filter();
        }
    }

}

module.exports = Component;
