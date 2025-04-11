/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractConfiguration } from '../../../../model/configuration/AbstractConfiguration';
import { TicketProperty } from '../../../ticket/model/TicketProperty';

export class CalendarConfiguration extends AbstractConfiguration {

    public constructor(
        public startDateProperty: string = 'DynamicFields.PlanBegin',
        public endDateProperty: string = 'DynamicFields.PlanEnd',
        public properties: string[] = [
            TicketProperty.CONTACT_ID,
            TicketProperty.STATE_ID,
            TicketProperty.QUEUE_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.CHANGED,
            'DynamicFields.PlanBegin',
            'DynamicFields.PlanEnd',
        ],
        public defaultView: string = 'month'
    ) {
        super();
    }

}
