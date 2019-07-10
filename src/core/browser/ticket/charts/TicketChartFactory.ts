import {
    TicketProperty, Ticket, KIXObjectType, DateTimeUtil, TicketPriority, TicketState, KIXObject
} from "../../../model";
import { LabelService } from "../../LabelService";
import { KIXObjectService } from "../../kix";
import { TicketLabelProvider } from "../TicketLabelProvider";

export class TicketChartFactory {

    private static INSTANCE: TicketChartFactory;

    public static getInstance(): TicketChartFactory {
        if (!TicketChartFactory.INSTANCE) {
            TicketChartFactory.INSTANCE = new TicketChartFactory();
        }
        return TicketChartFactory.INSTANCE;
    }

    private constructor() { }

    public async prepareData(property: TicketProperty, tickets: Ticket[]): Promise<Map<string, number>> {
        switch (property) {
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
                return await this.preparePropertyCountData(property, tickets);
            case TicketProperty.CREATED:
                return await this.prepareCreatedData(property, tickets);
            default:
                return new Map();
        }
    }

    private async preparePropertyCountData(property: TicketProperty, tickets: Ticket[]): Promise<Map<string, number>> {
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
        const data = await this.initMap(property, labelProvider);

        const ids = tickets.map((t) => t[property]);

        for (const id of ids) {
            const label = await labelProvider.getPropertyValueDisplayText(property, id);
            if (!data.has(label)) {
                data.set(label, 0);
            }

            data.set(label, data.get(label) + 1);
        }

        return data;
    }

    private async initMap(property: TicketProperty, labelProvider: TicketLabelProvider): Promise<Map<string, number>> {
        const map = new Map<string, number>();
        let objects: KIXObject[] = [];
        switch (property) {
            case TicketProperty.PRIORITY_ID:
                objects = await KIXObjectService.loadObjects<TicketPriority>(
                    KIXObjectType.TICKET_PRIORITY, null
                );
                break;
            case TicketProperty.STATE_ID:
                objects = await KIXObjectService.loadObjects<TicketState>(
                    KIXObjectType.TICKET_STATE, null
                );
            default:
        }

        for (const o of objects) {
            const label = await labelProvider.getPropertyValueDisplayText(property, o.ObjectId);
            map.set(label, 0);
        }
        return map;
    }

    private async prepareCreatedData(property: TicketProperty, tickets: Ticket[]): Promise<Map<string, number>> {
        const data = new Map<string, number>();
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 8);
        for (let i = 1; i <= 8; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            const label = await DateTimeUtil.getLocalDateString(currentDate);
            const createdTickets = tickets.filter((t) => DateTimeUtil.sameDay(currentDate, new Date(t.Created)));
            data.set(label, createdTickets.length);
        }
        return data;
    }

}
