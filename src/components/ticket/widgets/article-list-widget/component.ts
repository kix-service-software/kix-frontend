import { Article, ArticleProperty, Context, Ticket } from "@kix/core/dist/model";
import { ClientStorageService } from "@kix/core/dist/browser/ClientStorageService";
import { ArticleListWidgetComponentState } from './ArticleListWidgetComponentState';
import {
    TicketService,
    ArticleTableContentLayer,
    ArticleTableFilterLayer,
    ArticleTableLabelLayer,
    ArticleTableClickListener,
    ArticleTableSelectionListener,
    ArticleTableToggleListener,
    ArticleTableToggleLayer,
    TicketDetailsContext
} from "@kix/core/dist/browser/ticket";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import {
    TableColumnConfiguration, StandardTable, TableRowHeight, ITableConfigurationListener, TableColumn,
    TableSortLayer, ToggleOptions, ActionFactory
} from "@kix/core/dist/browser";
import { DashboardService } from "@kix/core/dist/browser/dashboard/DashboardService";
import { IdService } from "@kix/core/dist/browser/IdService";

export class ArticleListWidgetComponent {

    private state: ArticleListWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ArticleListWidgetComponentState();
        this.state.instanceId = 'article-list';
    }

    public onInput(input: any): void {
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        this.getArticles();
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setActions();
        this.setArticleTableConfiguration();
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.ticketId) {
            const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
            if (ticket) {
                this.state.generalArticleActions = ActionFactory.getInstance()
                    .generateActions(this.state.widgetConfiguration.settings.generalActions, true, ticket);
            }
        }
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getArticles();
            this.setActions();
            this.setArticleTableConfiguration();
        } else if (id === TicketDetailsContext.CONTEXT_ID && type === ContextNotification.GO_TO_ARTICLE) {
            ContextService.getInstance().notifyListener(
                this.state.instanceId, ContextNotification.TOGGLE_WIDGET, false
            );

            setTimeout(() => {
                ContextService.getInstance().notifyListener(
                    TicketDetailsContext.CONTEXT_ID, ContextNotification.SCROLL_TO_ARTICLE, args[0]
                );
                this.state.standardTable.loadRows();
            }, 500);
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
                new ArticleTableContentLayer(this.state.ticketId),
                new ArticleTableLabelLayer(),
                [new ArticleTableFilterLayer()],
                [new TableSortLayer()],
                new ArticleTableToggleLayer(new ArticleTableToggleListener(), true),
                columns,
                new ArticleTableSelectionListener(),
                new ArticleTableClickListener(),
                configurationListener,
                this.state.articles.length,
                true,
                TableRowHeight.LARGE,
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
            DashboardService.getInstance().saveWidgetConfiguration(
                this.state.instanceId, this.state.widgetConfiguration
            );
        }
    }

    private getArticles(): void {
        const ticket = TicketService.getInstance().getTicket(this.state.ticketId);
        if (ticket) {
            this.state.articles = ticket.Articles;
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
}

module.exports = ArticleListWidgetComponent;
