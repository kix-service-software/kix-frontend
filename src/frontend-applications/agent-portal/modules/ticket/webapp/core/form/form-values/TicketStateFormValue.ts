/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
        this.setNewInitialState('forbiddenValues', [6, 7]);
        await super.initFormValue();

        if (this.formValues?.length) {
            await this.formValues[0].initFormValue();
        }
    }

    public async reset(
        ignoreProperties?: string[], ignoreFormValueProperties?: string[], ignoreFormValueReset?: string[]
    ): Promise<void> {
        this.forbiddenValues = [6, 7];
        this.setNewInitialState('forbiddenValues', [6, 7]);
        await super.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
    }

}