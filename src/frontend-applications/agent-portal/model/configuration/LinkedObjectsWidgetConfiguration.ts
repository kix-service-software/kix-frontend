/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from './ConfigurationType';
import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class LinkedObjectsWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public linkedObjectTypes: Array<[string, KIXObjectType]>,
        public valid: boolean = true,
    ) { }

}
