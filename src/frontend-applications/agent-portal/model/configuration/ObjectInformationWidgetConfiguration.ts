/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { ConfigurationType } from './ConfigurationType';
import { KIXObjectType } from '../kix/KIXObjectType';
import { RoutingConfiguration } from './RoutingConfiguration';

export class ObjectInformationWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public objectType: KIXObjectType | string,
        public properties: string[] = [],
        public displayFlatList: boolean = false,
        public routingConfigurations: Array<[string, RoutingConfiguration]> = null,
        public valid: boolean = true,
    ) { }

}
