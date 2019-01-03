import { Ticket, Link, TicketProperty, KIXObjectType, KIXObjectLoadingOptions, LinkType } from '../../../../model';
import { AbstractTableLayer, TableRow, TableValue } from '../../../standard-table';
import { KIXObjectService } from '../../../kix';

export class LinkedTicketTableContentLayer extends AbstractTableLayer {

    private tickets: Ticket[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        private requestId: string,
        private ticketId: number,
        private linkedTickets: Link[] = [],
    ) {
        super();
    }

    public async getRows(): Promise<any[]> {
        if (!this.dataLoaded) {
            await this.loadLinkedTickets();
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const t of this.tickets) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

    private async loadLinkedTickets(): Promise<void> {
        const linkTypes = await KIXObjectService.loadObjects<LinkType>(
            KIXObjectType.LINK_TYPE
        );

        const linkedTickets: Array<[number, string]> = [];

        this.linkedTickets.forEach((link) => {
            let linkedObjectType;
            let linkedObjectKey;
            let linkedObjectLinkType;

            if (link.SourceObject === KIXObjectType.TICKET && link.SourceKey !== this.ticketId.toString()) {
                linkedObjectKey = link.SourceKey;
                linkedObjectType = link.SourceObject;
                const linkType = linkTypes.find((lt) => lt.Name === link.Type);
                linkedObjectLinkType = linkType ? linkType.SourceName : link.Type;
            } else if (link.TargetObject === KIXObjectType.TICKET && link.TargetKey !== this.ticketId.toString()) {
                linkedObjectKey = link.TargetKey;
                linkedObjectType = link.TargetObject;
                const linkType = linkTypes.find((lt) => lt.Name === link.Type);
                linkedObjectLinkType = linkType ? linkType.TargetName : link.Type;
            }

            if (linkedObjectType === KIXObjectType.TICKET) {
                linkedTickets.push([Number(linkedObjectKey), linkedObjectLinkType]);
            }
        });

        const columns = await this.getColumns();
        const loadingOptions = new KIXObjectLoadingOptions(
            columns.map((cc) => cc.id), null, null, null, linkedTickets.length
        );

        const tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, linkedTickets.map((t) => t[0]), loadingOptions
        );

        this.tickets = tickets.map((t) => {
            const linkedTicket = linkedTickets.find((lT) => lT[0] === Number(t[TicketProperty.TICKET_ID])) || [];
            t.LinkTypeName = linkedTicket[1] || '';
            return t;
        });

        this.dataLoaded = true;
    }
}
