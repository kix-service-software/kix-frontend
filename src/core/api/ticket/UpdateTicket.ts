
import { RequestObject } from '../RequestObject';
import { DynamicField, TicketProperty } from '../../model';

export class UpdateTicket extends RequestObject {

    public constructor(
        title: string, customerUser: string, customerId: string, stateId: number, priorityId: number, queueId: number,
        lockId: number, typeId: number, serviceId: number, slaId: number, ownerId: number, responsibleId: number,
        pendingTime: number, dynamicFields: DynamicField[],
    ) {
        super();

        this.applyProperty(TicketProperty.TITLE, title);
        this.applyProperty(TicketProperty.CUSTOMER_USER_ID, customerUser);
        this.applyProperty(TicketProperty.CUSTOMER_ID, customerId);
        this.applyProperty(TicketProperty.STATE_ID, stateId);
        this.applyProperty(TicketProperty.PRIORITY_ID, priorityId);
        this.applyProperty(TicketProperty.QUEUE_ID, queueId);
        this.applyProperty(TicketProperty.LOCK_ID, lockId);
        this.applyProperty(TicketProperty.TYPE_ID, typeId);
        this.applyProperty(TicketProperty.SERVICE_ID, serviceId);
        this.applyProperty(TicketProperty.SLA_ID, slaId);
        this.applyProperty(TicketProperty.OWNER_ID, ownerId);
        this.applyProperty(TicketProperty.RESPONSIBLE_ID, responsibleId);
        this.applyProperty(TicketProperty.PENDING_TIME, pendingTime);
        this.applyProperty(TicketProperty.DYNAMIC_FIELD, dynamicFields);
    }

}
