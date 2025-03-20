/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationDefinition } from '../../../model/configuration/ConfigurationDefinition';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { ObjectInformationCardConfiguration } from '../../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';

export class TicketCommunicationConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public type: string,
        public articleInformationConfiguration?: ObjectInformationCardConfiguration,
        public roleIds: number[] = [],
        public subConfigurationDefinition?: ConfigurationDefinition,
        public configuration?: IConfiguration,
        public application: string = 'agent-portal',
        public valid: boolean = true
    ) { }

}