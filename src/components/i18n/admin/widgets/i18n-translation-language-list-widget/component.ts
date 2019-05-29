import { ComponentState } from './ComponentState';
import { TranslationDetailsContext } from '../../../../../core/browser/i18n/admin/context';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import {
    KIXObjectPropertyFilter, TableFilterCriteria, KIXObjectType, TranslationLanguageProperty, Translation
} from '../../../../../core/model';
import {
    ContextService, ServiceRegistry, WidgetService, SearchOperator, ActionFactory,
    TableFactoryService, AbstractMarkoComponent, TableEvent, TableEventData
} from '../../../../../core/browser';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';
import { TranslationLabelProvider } from '../../../../../core/browser/i18n';

class Component extends AbstractMarkoComponent<ComponentState> {

    public tableSubscriber: IEventSubscriber;

    public labelProvider: TranslationLabelProvider;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new TranslationLabelProvider();
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );

        this.state.translation = context ? await context.getObject<Translation>(KIXObjectType.TRANSLATION) : null;

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('translation-languages-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ciClassId: string, translation: Translation, type: KIXObjectType) => {
                if (type === KIXObjectType.TRANSLATION_LANGUAGE) {
                    this.state.translation = translation;
                }
            }
        });

        await this.prepareFilter();
        await this.prepareTable();
        this.prepareActions();
        this.prepareTitle();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private prepareTitle(): void {
        const title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
        const count = this.state.table ? this.state.table.getRows(true).length : 0;
        this.state.title = `${title} (${count})`;
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'i18n-languages', KIXObjectType.TRANSLATION_LANGUAGE, null, null, TranslationDetailsContext.CONTEXT_ID, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'translation-admin-languages-table-listener',
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

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        this.state.table = table;
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
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

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            if (this.state.table) {
                this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
                this.state.table.filter();
            }
        }
    }
}

module.exports = Component;
