import { TicketDetails, Article, ArticleProperty } from "@kix/core/dist/model";
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";
import { ArticleListWidgetComponentState } from './ArticleListWidgetComponentState';
import { TicketService, ArticleTableLabelLayer, ArticleTableContentLayer } from "@kix/core/dist/browser/ticket";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import {
    TableColumnConfiguration, StandardTable, TableRowHeight, ITableConfigurationListener, TableColumn,
    TableSortLayer, TableFilterLayer, ToggleOptions
} from "@kix/core/dist/browser";
import { DashboardService } from "@kix/core/dist/browser/dashboard/DashboardService";

export class ArticleListWidgetComponent {

    private state: ArticleListWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ArticleListWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = Number(input.ticketId);
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        this.getArticles();
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration('article-list') : undefined;
        if (this.state.widgetConfiguration) {
            this.state.generalArticleActions = this.state.widgetConfiguration.settings.generalActions;
        }
        this.setArticleTableConfiguration();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getArticles();
            this.setArticleTableConfiguration();
        }
    }

    private setArticleTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const columns: TableColumnConfiguration[] = this.state.widgetConfiguration.settings.tableColumns || [];

            const configurationListener: ITableConfigurationListener<Article> = {
                columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            };

            this.state.standardTable = new StandardTable(
                new ArticleTableContentLayer(this.state.ticketId),
                new ArticleTableLabelLayer(),
                [new TableFilterLayer(
                    [ArticleProperty.NUMBER, ArticleProperty.ARTICLE_TYPE_ID, ArticleProperty.ATTACHMENT]
                )],
                [new TableSortLayer()],
                columns,
                null,
                null,
                configurationListener,
                this.state.articles.length,
                true,
                TableRowHeight.LARGE,
                true,
                new ToggleOptions('article-details', 'article', true)
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
        const ticketDetails: TicketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
        if (ticketDetails) {
            this.state.articles = ticketDetails.articles;
        }
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

    private toggleArticle(articleId: number): void {
        const index = this.state.expandedArticles.findIndex((a) => a === articleId);
        if (index >= 0) {
            this.state.expandedArticles.splice(index, 1);
            this.state.expandedArticles = [...this.state.expandedArticles];
        } else {
            this.state.expandedArticles = [...this.state.expandedArticles, articleId];
        }
    }

    // TODO: ggf. noch für den Artikel-Link der Historie-Lane
    private expandArticle(articleId: number): void {
        if (!this.state.expandedArticles.some((a) => a === articleId)) {
            this.state.expandedArticles = [...this.state.expandedArticles, articleId];
        }
    }

    private isArticleExpanded(articleId: number): boolean {
        return this.state.expandedArticles.some((a) => a === articleId);
    }

    private getAttachmentsCount(): number {
        let count = 0;

        if (this.state.articles) {
            this.state.articles.forEach((article) => {
                count += article.Attachments.filter((a) => a.Disposition !== 'inline').length;
            });
        }

        return count;
    }

    private attachmentsClicked(): void {
        alert('Alle Anlagen ...');
    }

    private filter(filterValue: string): void {
        this.state.standardTable.setFilterSettings(filterValue);
    }
}

module.exports = ArticleListWidgetComponent;
