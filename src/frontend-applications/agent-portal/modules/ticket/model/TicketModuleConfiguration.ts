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
        public addQueueSignature: boolean = true
    ) { }
}