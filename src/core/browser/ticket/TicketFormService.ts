import { KIXObjectFormService } from '../kix/KIXObjectFormService';
import { Ticket, KIXObjectType, TicketProperty, FormField, CRUD, ArticleProperty } from '../../model';
import { PendingTimeFormValue } from './form';
import { AuthenticationSocketClient } from '../application/AuthenticationSocketClient';
import { UIComponentPermission } from '../../model/UIComponentPermission';

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
        return kixObjectType === KIXObjectType.TICKET;
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
                default:
            }
        }
        return value;
    }

    public async hasPermissions(field: FormField): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case TicketProperty.QUEUE_ID:
                hasPermissions = await this.checkPermissions('queues');
                break;
            case TicketProperty.STATE_ID:
                hasPermissions = await this.checkPermissions('ticketstates');
                break;
            case TicketProperty.TYPE_ID:
                hasPermissions = await this.checkPermissions('tickettypes');
                break;
            case TicketProperty.PRIORITY_ID:
                hasPermissions = await this.checkPermissions('priorities');
                break;
            case TicketProperty.SERVICE_ID:
                hasPermissions = await this.checkPermissions('services');
                break;
            case TicketProperty.SLA_ID:
                hasPermissions = await this.checkPermissions('slas');
                break;
            case ArticleProperty.CHANNEL_ID:
                hasPermissions = await this.checkPermissions('channels');
                break;
            case ArticleProperty.ATTACHMENTS:
                hasPermissions = await this.checkPermissions('ticket/*/articles/*/attachments', [CRUD.CREATE]);
                break;
            case TicketProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                hasPermissions = await this.checkPermissions('users');
                break;
            default:
        }
        return hasPermissions;
    }

    private async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }
}
