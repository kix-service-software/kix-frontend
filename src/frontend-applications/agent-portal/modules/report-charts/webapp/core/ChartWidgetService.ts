/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ChartConfiguration } from 'chart.js';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Report } from '../../../reporting/model/Report';
import { ReportLoadingOptions } from '../../../reporting/model/ReportLoadingOptions';
import { ReportProperty } from '../../../reporting/model/ReportProperty';
import { ReportResult } from '../../../reporting/model/ReportResult';
import { ReportResultProperty } from '../../../reporting/model/ReportResultProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { FormatConfiguration } from '../../model/FormatConfiguration';
import { IReportChartDataMapper } from '../../model/IReportChartDataMapper';

export class ChartWidgetService {

    private static INSTANCE: ChartWidgetService;

    public static getInstance(): ChartWidgetService {
        if (!ChartWidgetService.INSTANCE) {
            ChartWidgetService.INSTANCE = new ChartWidgetService();
        }
        return ChartWidgetService.INSTANCE;
    }

    private constructor() { }

    private formatConfigurationComponents: Map<string, string> = new Map();
    private chartDataMapper: Map<string, IReportChartDataMapper> = new Map();

    public registerOutputFormatConfigurationComponent(format: string, componentId: string): void {
        this.formatConfigurationComponents.set(format, componentId);
    }

    public registerChartDataMapper(outputFormat: string, mapper: IReportChartDataMapper): void {
        this.chartDataMapper.set(outputFormat, mapper);
    }

    public getAvailableOutputFormats(): string[] {
        return Array.from(this.chartDataMapper.keys());
    }

    public getOutputFormatConfigTemplate(format: string): any {
        const componentId = this.formatConfigurationComponents.get(format);
        if (componentId) {
            return KIXModulesService.getComponentTemplate(componentId);
        }
    }

    public async prepareChartDataFromReport(
        chartConfig: ChartConfiguration, definitionId: number, outputFormat: string,
        formatConfiguration: FormatConfiguration
    ): Promise<ChartConfiguration> {

        const reportResult = await this.loadReportResult(definitionId, outputFormat);

        if (!reportResult) {
            const error = await TranslationService.translate('Translatable#No report available');
            throw error;
        }

        this.prepareData(chartConfig);

        const mapper = this.chartDataMapper.get(outputFormat);
        if (mapper) {
            const contentString = Buffer.from(reportResult.Content, 'base64').toString('utf8');
            chartConfig = await mapper.prepareChartData(chartConfig, contentString, formatConfiguration);
        }

        return chartConfig;
    }

    private async loadReportResult(definitionId: number, outputFormat: string): Promise<ReportResult> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    ReportProperty.DEFINITION_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, definitionId
                )
            ], 'Report.-CreateTime', null, [ReportProperty.RESULTS, ReportResultProperty.CONTENT]
        );
        const reports = await KIXObjectService.loadObjects<Report>(
            KIXObjectType.REPORT, null, loadingOptions, new ReportLoadingOptions(definitionId)
        ).catch((): Report[] => []);

        let result: ReportResult;
        if (reports?.length) {
            const report = reports.find((r) => r.Results?.some((rr) => rr.Format === outputFormat));
            result = report.Results?.find((r) => r.Format === outputFormat);
        }

        return result;
    }

    private prepareData(chartConfig: ChartConfiguration): void {
        if (!chartConfig.data) {
            chartConfig.data = {
                datasets: [],
                labels: []
            };
        }

        chartConfig.data.datasets = [];
        chartConfig.data.labels = [];
    }

}