import {
    Context, ConfiguredWidget, WidgetConfiguration, WidgetType, BreadcrumbInformation, KIXObject,
    KIXObjectType, TicketState
} from "../../../../../model";
import { TicketStateDetailsContextConfiguration } from "./TicketStateDetailsContextConfiguration";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { LabelService } from "../../../../LabelService";
import { ApplicationEvent } from "../../../../application";
import { TranslationService } from "../../../../i18n/TranslationService";

export class TicketStateDetailsContext extends Context<TicketStateDetailsContextConfiguration> {

    public static CONTEXT_ID = 'ticket-state-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<TicketState>(), true, !short);
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
        const objectName = await TranslationService.translate('Translatable#State');
        const state = await this.getObject<TicketState>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.TICKET_STATE, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadTicketState(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.TICKET_STATE, changedProperties)
            );
        }

        return object;
    }

    private async loadTicketState(changedProperties: string[] = [], cache: boolean = true): Promise<TicketState> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Ticket State ...' }
        );

        const ticketStateId = Number(this.objectId);

        const ticketStates = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, [ticketStateId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let ticketState: TicketState;
        if (ticketStates && ticketStates.length) {
            ticketState = ticketStates[0];
            this.objectId = ticketState.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return ticketState;
    }

}
