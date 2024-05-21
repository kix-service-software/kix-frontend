/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormGroupConfiguration } from './FormGroupConfiguration';
import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';

export class FormPageConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public id: string,
        public name: string,
        public groupConfigurationIds: string[] = [],
        public singleFormGroupOpen: boolean = false,
        public showSingleGroup: boolean = false,
        public groups: FormGroupConfiguration[] = [],
        public type: ConfigurationType = ConfigurationType.FormPage,
        public valid: boolean = true,
    ) { }

}
