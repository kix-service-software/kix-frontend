import { TicketDetailsContext } from '../../../core/browser/ticket/';
import { Ticket, WidgetType, KIXObjectType, TicketProperty } from '../../../core/model';
import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser/context/';
import { ActionFactory, WidgetService } from '../../../core/browser';
import { IdService } from '../../../core/browser/IdService';
import { ComponentsService } from '../../../core/browser/components';

export class Component {

    private state: ComponentState;

    private context: TicketDetailsContext;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );

        this.context.registerListener('ticket-details-component', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (ticketId: string, ticket: Ticket, type: KIXObjectType, changedProperties: string[]) => {
                if (type === KIXObjectType.TICKET) {
                    const scrollToArticle = changedProperties
                        ? changedProperties.some((p) => p === TicketProperty.ARTICLES)
                        : false;
                    this.initWidget(ticket, scrollToArticle);
                }
            }
        });

        await this.initWidget();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private async initWidget(ticket?: Ticket, scrollToArticle: boolean = false): Promise<void> {
        this.state.error = null;
        this.state.loading = true;

        if (this.context) {
            this.state.ticket = ticket ? ticket : await this.context.getObject<Ticket>().catch((error) => null);

            if (!this.state.ticket) {
                this.state.error = `Kein Ticket mit ID ${this.context.getObjectId()} verfügbar.`;
            }

            this.state.ticketDetailsConfiguration = this.context.getConfiguration();
            this.state.lanes = this.context.getLanes();
            this.state.tabWidgets = this.context.getLaneTabs();
            this.state.contentWidgets = this.context.getContent(true);

            await this.getTitle();

            this.setActions();
        }

        setTimeout(() => {
            this.state.loading = false;
            if (scrollToArticle) {
                this.scrollToContent();
            }
        }, 100);
    }

    private scrollToContent(): void {
        setTimeout(() => {
            const element = (this as any).getEl("ticket-content");
            if (element) {
                element.scrollIntoView(true);
                setTimeout(() => {
                    window.scrollBy(0, 450);
                }, 100);
            }
        }, 100);
    }

    private setActions(): void {
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            const actions = ActionFactory.getInstance().generateActions(
                config.generalActions, this.state.ticket
            );
            WidgetService.getInstance().registerActions(this.state.instanceId, actions);
        }
    }

    public getTicketActions(): string[] {
        let actions = [];
        const config = this.state.ticketDetailsConfiguration;
        if (config && this.state.ticket) {
            actions = ActionFactory.getInstance().generateActions(config.ticketActions, this.state.ticket);
        }
        return actions;
    }

    public getWidgetTemplate(instanceId: string): any {
        const config = this.context ? this.context.getWidgetConfiguration(instanceId) : undefined;
        return config ? ComponentsService.getInstance().getComponentTemplate(config.widgetId) : undefined;
    }

    public async getTitle(): Promise<void> {
        this.state.title = this.context ? await this.context.getDisplayText() : 'Ticket Details';
    }

    public getLaneKey(): string {
        return IdService.generateDateBasedId('lane-');
    }

    public getLaneWidgetType(): number {
        return WidgetType.LANE;
    }
}

module.exports = Component;
