import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { HistoryTableLabelProvider, HistoryTableContentProvider } from '@kix/core/dist/browser/ticket';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';
import { StandardTableColumn, StandardTableConfiguration, ITableClickListener } from '@kix/core/dist/browser';
import { TicketHistory } from '@kix/core/dist/model';

class TicketHistoryWidgetComponent {

    private state: TicketHistoryComponentState;

    public onCreate(input: any): void {
        this.state = new TicketHistoryComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.setHistoryTableConfiguration();
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.setHistoryTableConfiguration();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.setHistoryTableConfiguration();
        }
    }

    private setHistoryTableConfiguration(): void {
        if (this.state.widgetConfiguration) {
            const labelProvider = new HistoryTableLabelProvider();

            const columnConfig: StandardTableColumn[] = this.state.widgetConfiguration.settings.tableColumns || [];

            const contentProvider = new HistoryTableContentProvider(
                labelProvider, this.state.instanceId, this.state.ticketId, columnConfig, 7
            );

            const clickListener: ITableClickListener<TicketHistory> = {
                rowClicked: this.navigateToArticle.bind(this)
            };

            this.state.historyTableConfiguration = new StandardTableConfiguration(
                labelProvider, contentProvider, null, clickListener
            );
        }
    }

    private navigateToArticle(historyEntry: TicketHistory, columnId: string): void {
        if (columnId === 'ArticleID' && historyEntry[columnId]) {
            (this as any).emit('expandArticle', historyEntry[columnId]);
            const articleElement = document.getElementById(historyEntry[columnId].toString());
            articleElement.scrollIntoView();
        }
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private filterHistory(): void {
        if (this.state.filterValue !== null && this.state.filterValue !== "") {
            this.state.historyTableConfiguration.contentProvider.filterObjects(this.state.filterValue);
        } else {
            this.state.historyTableConfiguration.contentProvider.resetFilter();
        }
    }

    private print(): void {
        ApplicationStore.getInstance().toggleMainDialog();
    }

    private getTemplate(componentId: string): any {
        return ClientStorageHandler.getComponentTemplate(componentId);
    }

}

module.exports = TicketHistoryWidgetComponent;
