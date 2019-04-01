import {
    Context, ConfiguredWidget, WidgetConfiguration, WidgetType, BreadcrumbInformation, KIXObject,
    KIXObjectType, TicketPriority
} from "../../../../../model";
import { TicketPriorityDetailsContextConfiguration } from "./TicketPriorityDetailsContextConfiguration";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { LabelService } from "../../../../LabelService";
import { ApplicationEvent } from "../../../../application";
import { TranslationService } from "../../../../i18n/TranslationService";

export class TicketPriorityDetailsContext extends Context<TicketPriorityDetailsContextConfiguration> {

    public static CONTEXT_ID = 'ticket-priority-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketPriority>(), true, !short);
    }

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.sidebars.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        configuration = laneWidget ? laneWidget.configuration : undefined;

        if (!configuration) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
        }

        if (!configuration) {
            const contentWidget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
            configuration = contentWidget ? contentWidget.configuration : undefined;
        }

        return configuration;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = laneWidget ? WidgetType.LANE : undefined;

        if (!widgetType) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            widgetType = laneTabWidget ? WidgetType.LANE_TAB : undefined;
        }

        return widgetType;
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Type');
        const state = await this.getObject<TicketPriority>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketPriority(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.TICKET_PRIORITY, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketPriority(changedProperties: string[] = [], cache: boolean = true): Promise<TicketPriority> {
        const ticketPriorityId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Ticket Priority ...`
            });
        }, 500);

        const ticketPriorities = await KIXObjectService.loadObjects<TicketPriority>(
            KIXObjectType.TICKET_PRIORITY, [ticketPriorityId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let ticketPriority: TicketPriority;
        if (ticketPriorities && ticketPriorities.length) {
            ticketPriority = ticketPriorities[0];
            this.objectId = ticketPriority.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticketPriority;
    }

}
