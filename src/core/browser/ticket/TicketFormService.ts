import { KIXObjectFormService } from '../kix/KIXObjectFormService';
import {
    Ticket, KIXObjectType, TicketProperty, FormField, CRUD, ArticleProperty, FormContext,
    FormFieldValue, Form, TicketState, StateType
} from '../../model';
import { KIXObjectService } from '../kix';
import { LabelService } from '../LabelService';

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

    protected async additionalPreparations(
        form: Form, formFieldValues: Map<string, FormFieldValue<any>>, ticket: Ticket
    ): Promise<void> {
        if (form && form.formContext === FormContext.EDIT) {
            groupLoop: for (const g of form.groups) {
                for (const f of g.formFields) {
                    if (f.property === TicketProperty.STATE_ID) {
                        const stateId = formFieldValues.get(f.instanceId).value;
                        if (stateId && this.showPendingTimeField(stateId)) {
                            await this.setPendingTimeField(f, formFieldValues, ticket);
                        }
                        break groupLoop;
                    }
                }
            }
        }
    }

    private async showPendingTimeField(stateId: number): Promise<boolean> {
        let showPending = false;
        if (
            await this.checkPermissions('system/ticket/states')
            && await this.checkPermissions('system/ticket/states/types')
        ) {
            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null
            );
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );
            const state = states.find((s) => s.ID === stateId);
            if (state) {
                const stateType = stateTypes.find((t) => t.ID === state.TypeID);
                showPending = stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0;
            }
        }
        return showPending;
    }

    private async setPendingTimeField(
        typeField: FormField, formFieldValues: Map<string, FormFieldValue<any>>, ticket?: Ticket
    ): Promise<void> {
        const label = await LabelService.getInstance().getPropertyText(
            TicketProperty.PENDING_TIME, KIXObjectType.TICKET
        );
        const pendingField = new FormField(
            label, TicketProperty.PENDING_TIME, 'ticket-input-state-pending', true,
            null, null, new FormFieldValue(ticket.PendingTime), undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false
        );
        typeField.children.push(pendingField);
        formFieldValues.set(pendingField.instanceId, new FormFieldValue(ticket.PendingTime));
    }

    protected async getValue(property: string, value: any, ticket: Ticket): Promise<any> {
        if (value) {
            switch (property) {
                case TicketProperty.PENDING_TIME:
                    if (ticket) {
                        value = ticket[TicketProperty.PENDING_TIME]
                            ? new Date(ticket[TicketProperty.PENDING_TIME]) : null;
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
                hasPermissions = await this.checkPermissions('system/ticket/queues');
                break;
            case TicketProperty.STATE_ID:
                hasPermissions = await this.checkPermissions('system/ticket/states')
                    && await this.checkPermissions('system/ticket/states/types');
                break;
            case TicketProperty.TYPE_ID:
                hasPermissions = await this.checkPermissions('system/ticket/types');
                break;
            case TicketProperty.PRIORITY_ID:
                hasPermissions = await this.checkPermissions('system/ticket/priorities');
                break;
            case TicketProperty.SERVICE_ID:
                hasPermissions = await this.checkPermissions('system/services');
                break;
            case TicketProperty.SLA_ID:
                hasPermissions = await this.checkPermissions('system/slas');
                break;
            case ArticleProperty.CHANNEL_ID:
                hasPermissions = await this.checkPermissions('system/communication/channels');
                break;
            case ArticleProperty.ATTACHMENTS:
                hasPermissions = await this.checkPermissions('tickets/*/articles/*/attachments', [CRUD.CREATE]);
                break;
            case TicketProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                hasPermissions = await this.checkPermissions('system/users');
                break;
            default:
        }
        return hasPermissions;
    }
}
