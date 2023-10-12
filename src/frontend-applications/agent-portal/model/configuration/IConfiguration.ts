/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from './ConfigurationType';
import { ConfigurationDefinition } from './ConfigurationDefinition';

export interface IConfiguration {

    id: string;

    name: string;

    type: ConfigurationType | string;

    subConfigurationDefinition?: ConfigurationDefinition;

    configuration?: IConfiguration;

    application: string;

    valid: boolean;

}
