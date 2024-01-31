/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../IdService';
import { ConfigurationDefinition } from './ConfigurationDefinition';
import { IConfiguration } from './IConfiguration';

export abstract class AbstractConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string = IdService.generateDateBasedId(),
        public name: string = id,
        public type: string = null,
        public subConfigurationDefinition?: ConfigurationDefinition,
        public configuration?: IConfiguration,
        public valid: boolean = true,
    ) { }

}