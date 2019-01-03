import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { Ticket, KIXObjectType, TicketProperty } from "../../model";
import { PendingTimeFormValue } from "./form";
import { ContactService } from "../contact";
import { CustomerService } from "../customer";

export class TicketFormService extends KIXObjectFormService<Ticket> {

    private static INSTANCE: TicketFormService = null;

    public static getInstance(): TicketFormService {
        if (!TicketFormService.INSTANCE) {
            TicketFormService.INSTANCE = new TicketFormService();
        }

        return TicketFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET || kixObjectType === KIXObjectType.ARTICLE;
    }

    protected async getValue(property: string, value: any, ticket: Ticket): Promise<any> {
        if (value) {
            switch (property) {
                case TicketProperty.STATE_ID:
                    if (ticket) {
                        value = new PendingTimeFormValue(
                            value,
                            ticket[TicketProperty.PENDING_TIME] ? true : false,
                            ticket[TicketProperty.PENDING_TIME] ? new Date(ticket[TicketProperty.PENDING_TIME]) : null
                        );
                    }
                    break;
                case TicketProperty.CUSTOMER_USER_ID:
                    const contacts = await ContactService.getInstance().loadObjects(
                        KIXObjectType.CONTACT, [value], null
                    );
                    value = contacts && !!contacts.length ? contacts[0] : null;
                    break;
                case TicketProperty.CUSTOMER_ID:
                    const customers = await CustomerService.getInstance().loadObjects(
                        KIXObjectType.CUSTOMER, [value], null
                    );
                    value = customers && !!customers.length ? customers[0] : null;
                    break;
                default:
            }
        }
        return value;
    }
}
