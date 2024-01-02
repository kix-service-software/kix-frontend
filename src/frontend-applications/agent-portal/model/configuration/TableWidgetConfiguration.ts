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
import { SortOrder } from '../SortOrder';
import { ConfigurationDefinition } from './ConfigurationDefinition';
import { KIXObjectPropertyFilter } from '../KIXObjectPropertyFilter';
import { TableConfiguration } from './TableConfiguration';

export class TableWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public objectType: KIXObjectType | string,
        public sort?: [string, SortOrder],
        public subConfigurationDefinition?: ConfigurationDefinition,
        tableConfiguration?: TableConfiguration, // TODO: @deprecated: use configuration instead
        public headerComponents?: string[],
        public showFilter: boolean = true,
        public shortTable: boolean = false,
        public predefinedTableFilters: KIXObjectPropertyFilter[] = [],
        public cache: boolean = true,
        public resetFilterOnReload: boolean = true,
        public configuration: IConfiguration = tableConfiguration,
        public valid: boolean = true,
    ) { }

}
