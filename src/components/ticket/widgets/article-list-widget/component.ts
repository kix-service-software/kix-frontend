import { TicketDetails } from "@kix/core/dist/model";
import { ClientStorageHandler } from "@kix/core/dist/browser/ClientStorageHandler";
import { ArticleListWidgetComponentState } from './ArticleListWidgetComponentState';
import { TicketService } from "@kix/core/dist/browser/ticket";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { StandardTableColumn } from "@kix/core/dist/browser";

export class ArticleListWidgetComponent {

    private state: ArticleListWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ArticleListWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = Number(input.ticketId);
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
            // const labelProvider = new HistoryTableLabelProvider();

            const columnConfig: StandardTableColumn[] = this.state.widgetConfiguration.settings.tableColumns || [];

            // const contentProvider = new HistoryTableContentProvider(
            //     labelProvider, this.state.instanceId, this.state.ticketId, columnConfig, 7
            // );

            // const clickListener: ITableClickListener<TicketHistory> = {
            //     rowClicked: this.navigateToArticle.bind(this)
            // };

            // const configurationListener: ITableConfigurationListener<TicketHistory> = {
            //     columnConfigurationChanged: this.columnConfigurationChanged.bind(this)
            // };

            // this.state.historyTableConfiguration = new StandardTableConfiguration(
            //     labelProvider, contentProvider, null, clickListener, configurationListener
            // );
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
}

module.exports = ArticleListWidgetComponent;
