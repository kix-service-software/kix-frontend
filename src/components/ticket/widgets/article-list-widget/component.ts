import { Article, Ticket, KIXObjectType, ContextMode } from "@kix/core/dist/model";
import { ComponentState } from './ComponentState';
import {
    ArticleTableContentLayer,
    ArticleTableFilterLayer,
    ArticleTableLabelLayer,
    ArticleTableClickListener,
    ArticleTableSelectionListener,
    ArticleTableToggleListener,
    ArticleTableToggleLayer
} from "@kix/core/dist/browser/ticket";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    TableColumnConfiguration, StandardTable, TableRowHeight, ITableConfigurationListener, TableColumn,
    TableSortLayer, ToggleOptions, ActionFactory, TableHeaderHeight
} from "@kix/core/dist/browser";
import { IdService } from "@kix/core/dist/browser/IdService";
import { IEventListener, EventService } from "@kix/core/dist/browser/event";

export class Component implements IEventListener {

    private state: ComponentState;
    public eventSubscriberId: string = 'ArticleList';

    public onCreate(input: any): void {
        this.state = new ComponentState(Number(input.ticketId), 'article-list');
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        await this.setTicket();
        this.getArticles();
        this.setActions();
        this.setArticleTableConfiguration();

        EventService.getInstance().subscribe('ShowArticleInTicketDetails', this);
        EventService.getInstance().subscribe('ArticleTableRowToggled', this);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('ShowArticleInTicketDetails', this);
        EventService.getInstance().unsubscribe('ArticleTableRowToggled', this);
    }

    public async setTicket(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context.objectId) {
            const ticketsResponse = await ContextService.getInstance().loadObjects<Ticket>(
                KIXObjectType.TICKET, [context.objectId], ContextMode.DETAILS
            );
            this.state.ticket = ticketsResponse && ticketsResponse.length ? ticketsResponse[0] : null;
        }
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticket) {
            this.state.generalArticleActions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.settings.generalActions, true, this.state.ticket);
        }
    }

    private setArticleTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const columns: TableColumnConfiguration[] = this.state.widgetConfiguration.settings.tableColumns || [];

            const configurationListener: ITableConfigurationListener<Article> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.standardTable = new StandardTable(
                IdService.generateDateBasedId(),
                new ArticleTableContentLayer(this.state.ticket),
                new ArticleTableLabelLayer(),
                [new ArticleTableFilterLayer()],
                [new TableSortLayer()],
                new ArticleTableToggleLayer(new ArticleTableToggleListener(), true),
                null,
                null,
                columns,
                new ArticleTableSelectionListener(),
                new ArticleTableClickListener(),
                configurationListener,
                this.state.articles.length,
                true,
                TableRowHeight.LARGE,
                TableHeaderHeight.LARGE,
                true,
                new ToggleOptions(
                    'ticket-article-details',
                    'article',
                    this.state.widgetConfiguration.actions,
                    true
                )
            );
        }
    }

    private columnConfigurationChanged(column: TableColumn): void {
        const index =
            this.state.widgetConfiguration.settings.tableColumns.findIndex((tc) => tc.columnId === column.id);

        if (index >= 0) {
            this.state.widgetConfiguration.settings.tableColumns[index].size = column.size;
            ContextService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private getArticles(): void {
        if (this.state.ticket) {
            this.state.articles = this.state.ticket.Articles;
        }
    }

    private getAttachmentsCount(): number {
        let count = 0;

        if (this.state.articles) {
            this.state.articles.forEach((article) => {
                if (article.Attachments) {
                    count += article.Attachments.length;
                }
            });
        }

        return count;
    }

    private attachmentsClicked(): void {
        alert('Alle Anlagen ...');
    }

    private filter(filterValue: string): void {
        this.state.filterValue = filterValue;
        this.state.standardTable.setFilterSettings(filterValue);
    }

    private getTitle(): string {
        return 'Artikelübersicht (' + (this.state.articles ? this.state.articles.length : '0') + ')';
    }

    public eventPublished(data: any, eventId: string): void {
        if (eventId === 'ArticleTableRowToggled') {
            this.state.standardTable.loadRows();
        } else {
            EventService.getInstance().publish(this.state.eventSubscriberWidgetPrefix + 'SetMinimizedToFalse');
            setTimeout(() => {
                EventService.getInstance().publish('ScrollToArticleInArticleTable', data);
            }, 500);
        }
    }
}

module.exports = Component;
