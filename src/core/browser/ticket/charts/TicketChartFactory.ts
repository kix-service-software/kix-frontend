import { TicketProperty, Ticket, KIXObjectType, DateTimeUtil, TicketPriority, TicketState } from "../../../model";
import { LabelService } from "../../LabelService";
import { KIXObjectService } from "../../kix";
import { ObjectDataService } from "../../ObjectDataService";

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
        const data = await this.initMap(property);
        for (const t of tickets) {
            if (t[property]) {
                const label = await labelProvider.getPropertyValueDisplayText(property, t[property]);
                if (!data.has(label)) {
                    data.set(label, 0);
                }

                data.set(label, data.get(label) + 1);
            }
        }
        return data;
    }

    private async initMap(property: TicketProperty): Promise<Map<string, number>> {
        const objectData = ObjectDataService.getInstance().getObjectData();
        const map = new Map<string, number>();
        switch (property) {
            case TicketProperty.PRIORITY_ID:
                const priorities = await KIXObjectService.loadObjects<TicketPriority>(
                    KIXObjectType.TICKET_PRIORITY, null
                );
                priorities.forEach((p) => map.set(p.Name, 0));
                return map;
            case TicketProperty.STATE_ID:
                const states = await KIXObjectService.loadObjects<TicketState>(
                    KIXObjectType.TICKET_STATE, null
                );
                states.forEach((s) => map.set(s.Name, 0));
                return map;
            default:
                return map;
        }
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
