import { ContextService, ContextNotification } from '@kix/core/dist/browser/context';
import { SortOrder } from '@kix/core/dist/browser/SortOrder';
import { TicketUtil, TicketService } from '@kix/core/dist/browser/ticket';
import { TicketHistory } from '@kix/core/dist/model/ticket/TicketHistory';
import { TicketHistoryComponentState } from './TicketHistoryComponentState';
import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class TicketHistoryWidgetComponent {

    private state: TicketHistoryComponentState;

    public onCreate(input: any): void {
        this.state = new TicketHistoryComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextNotified.bind(this));
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.getTicket();
    }

    private contextNotified(id: string | number, type: ContextNotification, ...args): void {
        if (id === this.state.ticketId && type === ContextNotification.OBJECT_UPDATED) {
            this.getTicket();
        }
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails) {
                this.state.history = ticketDetails.history.sort(
                    (a: TicketHistory, b: TicketHistory) => b.CreateTime.localeCompare(a.CreateTime)
                );
                this.state.filteredHistory = this.state.history;
            }
        }
    }

    private getDateTimeString(date: string): string {
        return TicketUtil.getDateTimeString(date);
    }

    private getUserName(value: any): string {
        return TicketUtil.getPropertyValue("UserID", value, this.state.ticketId);
    }

    private navigateToArticle(articleId: number, event: any): void {
        event.stopPropagation();

        (this as any).emit('expandArticle', articleId);

        const articleElement = document.getElementById(articleId.toString());
        articleElement.scrollIntoView();
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private filterHistory(): void {
        this.state.filteredHistory = TicketUtil.filterTicketHistory(this.state.history, this.state.filterValue);
        (this as any).setStateDirty('filteredHistory');
    }

    private sortUp(property: string): void {
        this.state.filteredHistory = TicketUtil.sortTicketHistory(SortOrder.UP, this.state.filteredHistory, property);
        (this as any).setStateDirty('filteredHistory');
    }

    private sortDown(property: string): void {
        this.state.filteredHistory = TicketUtil.sortTicketHistory(SortOrder.DOWN, this.state.filteredHistory, property);
        (this as any).setStateDirty('filteredHistory');
    }

    private print(): void {
        ApplicationStore.getInstance().toggleMainDialog();
    }

}

module.exports = TicketHistoryWidgetComponent;
