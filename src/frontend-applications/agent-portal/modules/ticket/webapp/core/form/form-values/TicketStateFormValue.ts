/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import { PendingTimeFormValue } from './PendingTimeFormValue';

export class TicketStateFormValue extends SelectObjectFormValue {

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);

        this.objectType = KIXObjectType.TICKET_STATE;

        this.formValues.push(new PendingTimeFormValue(TicketProperty.PENDING_TIME, ticket, objectValueMapper, this));
    }

    public async initFormValue(): Promise<void> {
        this.forbiddenValues = [6, 7];
        await super.initFormValue();
    }

}