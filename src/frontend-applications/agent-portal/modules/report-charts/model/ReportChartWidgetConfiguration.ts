/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationDefinition } from '../../../model/configuration/ConfigurationDefinition';
import { ConfigurationType } from '../../../model/configuration/ConfigurationType';
import { IConfiguration } from '../../../model/configuration/IConfiguration';
import { ChartComponentConfiguration } from './ChartComponentConfiguration';
import { FormatConfiguration } from './FormatConfiguration';

export class ReportChartWidgetConfiguration implements IConfiguration {

    public type: string = ConfigurationType.ChartWidget;
    public subConfigurationDefinition?: ConfigurationDefinition;

    public application: string = 'agent-portal';

    public roleIds: number[] = [];

    public constructor(
        public id: string,
        public name: string,
        public configuration?: ChartComponentConfiguration,
        public reportDefinitionId?: number,
        public reportOutputFormat?: string,
        public formatConfiguration?: FormatConfiguration,
        public useReportTitle: boolean = true,
        public valid: boolean = true,
    ) { }

}