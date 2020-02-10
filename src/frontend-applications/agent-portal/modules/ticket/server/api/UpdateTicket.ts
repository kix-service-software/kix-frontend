/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from "../../../../../../server/model/rest/RequestObject";
import { TicketProperty } from "../../model/TicketProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";

export class UpdateTicket extends RequestObject {

    public constructor(
        title: string, contactId: string, organisationId: string, stateId: number, priorityId: number, queueId: number,
        lockId: number, typeId: number, serviceId: number, slaId: number, ownerId: number, responsibleId: number,
        pendingTime: number, dynamicFields: [], state: string
    ) {
        super();

        this.applyProperty(TicketProperty.TITLE, title);
        this.applyProperty(TicketProperty.CONTACT_ID, contactId);
        this.applyProperty(TicketProperty.ORGANISATION_ID, organisationId);
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
        this.applyProperty(TicketProperty.STATE, state);
        this.applyProperty(KIXObjectProperty.DYNAMIC_FIELDS, dynamicFields);
    }

}
