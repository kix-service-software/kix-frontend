/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RoutingConfiguration } from '../../../../../../model/configuration/RoutingConfiguration';
import { Ticket } from '../../../../../ticket/model/Ticket';

import { TicketLabelProvider } from '../../../../../ticket/webapp/core';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';

export class ComponentState {

    public constructor(
        public routingConfiguration: RoutingConfiguration = null,
        public expanded: boolean = false,
        public ticket: Ticket = null,
        public title: string = '',
        public organisation: string = '',
        public ticketNumber: string = '',
        public prepared: boolean = false,
        public labelProvider: TicketLabelProvider = new TicketLabelProvider(),
        public icon: string | ObjectIcon = null,
        public properties: string[] = [],
        public avatar: ObjectIcon | string = null,
        public initials: string = '',
        public contactTooltip: string = '',
        public userColor: string = '',
        public update: boolean = false
    ) { }

}
