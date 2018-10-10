import { Ticket, KIXObjectType, Context, ComponentContent, ToastContent, OverlayType } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import {
    ArticleTableContentLayer,
    ArticleTableFilterLayer,
    ArticleTableLabelLayer,
    ArticleTableClickListener,
    ArticleTableToggleListener,
    ArticleTableToggleLayer
} from "@kix/core/dist/browser/ticket";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    StandardTable, ITableConfigurationListener, TableColumn,
    TableSortLayer, ActionFactory, TableListenerConfiguration, TableLayerConfiguration, WidgetService, OverlayService
} from "@kix/core/dist/browser";
import { IdService } from "@kix/core/dist/browser/IdService";
import { IEventListener, EventService } from "@kix/core/dist/browser/event";

export class Component implements IEventListener {

    private state: ComponentState;
    public eventSubscriberId: string = 'ArticleList';

    public onCreate(input: any): void {
        this.state = new ComponentState(Number(input.ticketId));
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('article-list-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    this.initWidget(ticket);
                }
            }
        });

        EventService.getInstance().subscribe('GotToTicketArticle', this);

        await this.initWidget(await context.getObject<Ticket>());
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.loading = true;
        this.state.ticket = ticket;
        this.prepareArticles();
        this.prepareActions();
        this.prepareArticleTableConfiguration();
        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('ShowArticleInTicketDetails', this);
        EventService.getInstance().unsubscribe('ArticleTableRowToggled', this);

        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private prepareActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.generalArticleActions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.settings.generalActions, true, [this.state.ticket]);

            WidgetService.getInstance().registerActions(this.state.instanceId, this.state.generalArticleActions);
        }
    }

    private prepareArticleTableConfiguration(): void {
        if (this.state.widgetConfiguration) {

            const tableConfiguration = this.state.widgetConfiguration.settings.tableConfiguration;
            tableConfiguration.displayLimit = this.state.articles.length;

            const layerConfiguration = new TableLayerConfiguration(
                new ArticleTableContentLayer(this.state.ticket),
                new ArticleTableLabelLayer(),
                [new ArticleTableFilterLayer()],
                [new TableSortLayer()],
                new ArticleTableToggleLayer(new ArticleTableToggleListener(), true)
            );

            const configurationListener: ITableConfigurationListener = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };
            const listenerConfiguration = new TableListenerConfiguration(
                new ArticleTableClickListener(), null, configurationListener
            );

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                tableConfiguration, layerConfiguration, listenerConfiguration
            );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableConfiguration.tableColumns
                .findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableConfiguration.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private prepareArticles(): void {
        if (this.state.ticket) {
            this.state.articles = [...this.state.ticket.Articles];
            this.state.title = 'Artikelübersicht (' + (this.state.articles ? this.state.articles.length : '0') + ')';

            let count = 0;
            this.state.articles.forEach((article) => {
                if (article.Attachments) {
                    count += article.Attachments.length;
                }
            });

            this.state.attachmentCount = count;
        }
    }

    public attachmentsClicked(): void {
        const content = new ComponentContent('toast', new ToastContent(
            'Coming Soon', 'kix-icon-magicwand', 'Diese Funktionalität ist in Arbeit.'
        ));
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

    public filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }

    public eventPublished(data: any, eventId: string): void {
        const widgetComponent = (this as any).getComponent('article-list-widget');
        if (widgetComponent && widgetComponent.state.minimized) {
            widgetComponent.state.minimized = false;
        }

        if (eventId === 'GotToTicketArticle') {
            setTimeout(() => {
                const tableComponent = (this as any).getComponent('article-list-table');
                if (tableComponent) {
                    tableComponent.scrollToObject(data);
                }
            }, 200);
        }
    }
}

module.exports = Component;
