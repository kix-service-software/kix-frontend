import {
    Ticket, KIXObjectType, ComponentContent, ToastContent, OverlayType, TicketEvent
} from "../../../../core/model";
import { ComponentState } from './ComponentState';
import { TicketDetailsContext, } from "../../../../core/browser/ticket";
import { ContextService } from "../../../../core/browser/context";
import {
    ActionFactory, WidgetService, OverlayService, TableFactoryService, TableEvent
} from "../../../../core/browser";
import { EventService, IEventSubscriber } from "../../../../core/browser/event";

export class Component {

    private state: ComponentState;

    private subscriber: IEventSubscriber;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
            TicketDetailsContext.CONTEXT_ID
        );
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('article-list-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            objectChanged: async (ticketId: string, ticket: Ticket, type: KIXObjectType) => {
                if (type === KIXObjectType.TICKET) {
                    ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
                    this.initWidget(ticket);
                }
            }
        });

        this.subscriber = {
            eventSubscriberId: 'article-list-widget',
            eventPublished: (data: any, eventId: string) => {
                if (eventId === TicketEvent.SCROLL_TO_ARTICLE) {
                    EventService.getInstance().publish(
                        TableEvent.SCROLL_AND_TOGGLE_TO_OBJECT_ID,
                        {
                            tableId: this.state.table.getTableId(),
                            objectId: data
                        }
                    );
                }
            }
        };
        EventService.getInstance().subscribe(TicketEvent.SCROLL_TO_ARTICLE, this.subscriber);

        await this.initWidget(await context.getObject<Ticket>(KIXObjectType.TICKET));
    }

    private async initWidget(ticket: Ticket): Promise<void> {
        this.state.loading = true;
        this.prepareArticles(ticket);
        this.prepareActions(ticket);
        await this.prepareTable();
        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
    }

    private prepareArticles(ticket: Ticket): void {
        if (ticket) {
            const articles = [...ticket.Articles];
            this.state.title = 'Artikelübersicht (' + (articles ? articles.length : '0') + ')';

            let count = 0;
            articles.forEach((article) => {
                if (article.Attachments) {
                    const attachments = article.Attachments.filter((a) => a.Disposition !== 'inline');
                    if (attachments.length > 0) {
                        count += attachments.length;
                    }
                }
            });

            this.state.attachmentCount = count;
        }
    }

    private prepareActions(ticket: Ticket): void {
        if (this.state.widgetConfiguration && ticket) {
            const generalArticleActions = ActionFactory.getInstance()
                .generateActions(this.state.widgetConfiguration.settings.generalActions, [ticket]);

            WidgetService.getInstance().registerActions(this.state.instanceId, generalArticleActions);
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.widgetConfiguration) {
            const tableConfiguration = this.state.widgetConfiguration.settings.tableConfiguration;
            const table = TableFactoryService.getInstance().createTable(
                KIXObjectType.ARTICLE, tableConfiguration, null, TicketDetailsContext.CONTEXT_ID, false, true
            );

            await table.initialize();
            this.state.table = table;
        }
    }

    public attachmentsClicked(): void {
        const content = new ComponentContent('toast', new ToastContent(
            'kix-icon-magicwand', 'Diese Funktionalität ist in Arbeit.', 'Coming Soon'
        ));
        OverlayService.getInstance().openOverlay(OverlayType.HINT_TOAST, null, content, '');
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

}

module.exports = Component;
