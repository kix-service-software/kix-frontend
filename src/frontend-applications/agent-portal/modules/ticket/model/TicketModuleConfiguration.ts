/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class TicketModuleConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'ticket-module-configuration';

    public application: string = 'agent-portal';

    public constructor(
        public id: string = TicketModuleConfiguration.CONFIGURATION_ID,
        public name: string = 'Ticket Module Configuration',
        public type: string = 'Ticket Module',
        public valid: boolean = true,
        public roleIds: number[] = [],
        public addQueueSignature: boolean = true,
        public ticketColors: TicketColorConfiguration = new TicketColorConfiguration()
    ) { }
}


export class TicketColorConfiguration {

    public constructor(
        public stateTypes: any = {
            open: null,
            new: null,
            closed: 'color:#9e9e9e;',
            'pending reminder': 'background-color:#008dd2 !important;color:#ffffff',
            'pending reminder reached': 'background-color:#e31e24 !important;color:#ffffff',
            'pending auto': 'background-color:#008dd2 !important;color:#ffffff',
            'pending auto reached': 'background-color:#e31e24 !important;color:#ffffff',
            removed: 'color:#9e9e9e',
            merged: 'color:#9e9e9e'
        },
        public states: any = {
            unseen: 'font-weight:bold;'
        }
    ) { }
}
