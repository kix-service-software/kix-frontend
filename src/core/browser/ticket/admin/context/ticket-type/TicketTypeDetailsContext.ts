import {
    Context, ConfiguredWidget, WidgetConfiguration, WidgetType, BreadcrumbInformation, KIXObject,
    KIXObjectType, KIXObjectCache, TicketType
} from "../../../../../model";
import { TicketTypeDetailsContextConfiguration } from "./TicketTypeDetailsContextConfiguration";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { LabelService } from "../../../../LabelService";
import { ApplicationEvent } from "../../../../application";

export class TicketTypeDetailsContext extends Context<TicketTypeDetailsContextConfiguration> {

    public static CONTEXT_ID = 'ticket-type-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketType>(), true, !short);
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

    public getBreadcrumbInformation(): BreadcrumbInformation {
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID]);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_TYPE, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        let ticketType;

        if (!objectType) {
            objectType = KIXObjectType.TICKET_TYPE;
        }

        if (reload && objectType === KIXObjectType.TICKET_TYPE) {
            KIXObjectCache.removeObject(KIXObjectType.TICKET_TYPE, Number(this.objectId));
        }

        if (!KIXObjectCache.isObjectCached(KIXObjectType.TICKET_TYPE, Number(this.objectId))) {
            ticketType = await this.loadTicketType(changedProperties);
        } else {
            ticketType = KIXObjectCache.getObject(KIXObjectType.TICKET_TYPE, Number(this.objectId));
        }

        return ticketType;
    }

    private async loadTicketType(changedProperties: string[] = [], cache: boolean = true): Promise<TicketType> {
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: true, hint: 'Lade Tickettyp ...' });

        const ticketTypeId = Number(this.objectId);

        const ticketTypes = await KIXObjectService.loadObjects<TicketType>(
            KIXObjectType.TICKET_TYPE, [ticketTypeId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let ticketType: TicketType;
        if (ticketTypes && ticketTypes.length) {
            ticketType = ticketTypes[0];
            this.objectId = ticketType.ID;
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), ticketType, KIXObjectType.TICKET_TYPE, changedProperties)
            );
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticketType;
    }

}
