/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class DisplayValueConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'display-value-configuration';

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public displayValues: DisplayValue[] = [
            new DisplayValue(
                KIXObjectType.ORGANISATION,
                '<KIX_ORGANISATION_Name> (<KIX_ORGANISATION_Number>)'
            )
        ],
        public id: string = DisplayValueConfiguration.CONFIGURATION_ID,
        public name: string = 'Display Value Configuration',
        public type: string = 'Agent Portal',
        public valid: boolean = true,
    ) { }

}

class DisplayValue {

    public constructor(
        public objectType: KIXObjectType | string,
        public pattern: string
    ) { }

}