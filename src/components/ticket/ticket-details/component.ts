import { TicketService, TicketDetailsContext } from '@kix/core/dist/browser/ticket/';
import { ComponentRouterService } from '@kix/core/dist/browser/router';
import {
    BreadcrumbDetails, Ticket, Context, WidgetType, ContextType, KIXObjectType, ContextMode, KIXObjectLoadingOptions
} from '@kix/core/dist/model';
import { TicketDetailsComponentState } from './TicketDetailsComponentState';
import { ContextService } from '@kix/core/dist/browser/context/';
import { ActionFactory } from '@kix/core/dist/browser';
import { IdService } from '@kix/core/dist/browser/IdService';
import { ComponentsService } from '@kix/core/dist/browser/components';

export class TicketDetailsComponent {

    private state: TicketDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketDetailsComponentState(Number(input.objectId));
    }

    public async onMount(): Promise<void> {
        ContextService.getInstance().registerListener({
            contextChanged: (contextId: string, ticketDeatilsContext: TicketDetailsContext, type: ContextType) => {
                if (type === ContextType.MAIN && contextId === TicketDetailsContext.CONTEXT_ID) {
                    this.state.ticketDetailsConfiguration = ticketDeatilsContext.configuration;
                    this.state.loadingConfig = false;
                    this.state.lanes = ticketDeatilsContext.getLanes();
                    this.state.tabWidgets = ticketDeatilsContext.getLaneTabs();
                    (this as any).update();
                }
            }
        });

        this.loadTicket();
    }

    private async loadTicket(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            ['Ticket.*'], null, null, null, null,
            ['TimeUnits', 'DynamicFields', 'Links', 'Articles', 'Attachments', 'Flags', 'History', 'Watchers'],
            ['Links', 'Articles', 'Attachments', 'Flags', 'History']
        );
        const ticketsResponse = await ContextService.getInstance().loadObjects<Ticket>(
            KIXObjectType.TICKET, [this.state.ticketId], ContextMode.DETAILS, loadingOptions
        );
        this.state.ticket = ticketsResponse && ticketsResponse.length ? ticketsResponse[0] : null;
        this.state.loadingTicket = false;
        this.setTicketHookInfo();
    }

    private getActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            actions = ActionFactory.getInstance().generateActions(config.generalActions, true, [this.state.ticket]);
        }
        return actions;
        // TODO: wie folgt Action übergeben
        // WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private getTicketActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            actions = ActionFactory.getInstance().generateActions(config.ticketActions, true, [this.state.ticket]);
        }
        return actions;
    }

    private setTicketHookInfo(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.ticketHook = objectData.ticketHook;
            this.state.ticketHookDivider = objectData.ticketHookDivider;
        }
    }

    private getWidgetTemplate(instanceId: string): any {
        const context = ContextService.getInstance().getActiveContext();
        const config = context ? context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    private getTitle(): string {
        if (this.state.ticket) {
            const titlePrefix = this.state.ticketHook + this.state.ticketHookDivider + this.state.ticket.TicketNumber;
            return titlePrefix + " - " + this.state.ticket.Title;
        }
        return '';
    }

    private getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    private getLaneWidgetType(): number {
        return WidgetType.LANE;
    }
}

module.exports = TicketDetailsComponent;
