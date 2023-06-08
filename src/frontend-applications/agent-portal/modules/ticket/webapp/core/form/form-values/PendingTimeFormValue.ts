/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { DateTimeFormValue } from '../../../../../object-forms/model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import { TicketService } from '../../TicketService';

export class PendingTimeFormValue extends DateTimeFormValue {

    private defaultValue: string;

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);
        this.label = 'Translatable#Pending time';
    }

    public async initFormValue(): Promise<void> {
        const isPending = await TicketService.isPendingState(this.object[TicketProperty.STATE_ID]);
        this.enabled = isPending;
        this.visible = isPending;

        this.isSortable = false;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        this.defaultValue = field.defaultValue?.value;

        this.object.addBinding(TicketProperty.STATE_ID, async (value: number) => {
            const isPending = await TicketService.isPendingState(value);
            this.enabled = isPending;
            this.visible = isPending;

            this.setNewInitialState('enabled', this.enabled);
            this.setNewInitialState('visible', this.visible);

            // this.defaultValue contains the origin value of the FormFieldConfiguration
            // it's needed to calculate the right pending time
            const pendingDate = await TicketService.getPendingDateDiff(this.defaultValue || this.value);
            this.setFormValue(DateTimeUtil.getKIXDateTimeString(pendingDate));

            this.minDate = DateTimeUtil.getKIXDateTimeString(new Date());
        });

        return super.initFormValueByField(field);
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        value = DateTimeUtil.calculateRelativeDate(value);
        await super.setFormValue(value, force);
    }

}