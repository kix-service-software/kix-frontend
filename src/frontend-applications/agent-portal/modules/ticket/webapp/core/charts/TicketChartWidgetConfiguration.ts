/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../../../model/configuration/IConfiguration';
import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TicketProperty } from '../../../model/TicketProperty';
import { ConfigurationDefinition } from '../../../../../model/configuration/ConfigurationDefinition';
import { ChartComponentConfiguration } from '../../../../report-charts/model/ChartComponentConfiguration';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';

export class TicketChartWidgetConfiguration implements IConfiguration {

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public property: TicketProperty,
        public subConfigurationDefinition?: ConfigurationDefinition,
        public configuration?: ChartComponentConfiguration,
        public loadingOptions?: KIXObjectLoadingOptions,
        public valid: boolean = true,
    ) { }

}
