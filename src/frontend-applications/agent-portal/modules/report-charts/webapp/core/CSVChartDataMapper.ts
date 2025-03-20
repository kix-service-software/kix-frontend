/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ChartConfiguration } from 'chart.js';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { CSVFormatConfiguration } from '../../model/CSVFormatConfiguration';
import { FormatConfiguration } from '../../model/FormatConfiguration';
import { IReportChartDataMapper } from '../../model/IReportChartDataMapper';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { DefaultColorConfiguration } from '../../../../model/configuration/DefaultColorConfiguration';
import { config } from 'node:process';

export class CSVChartDataMapper implements IReportChartDataMapper {

    public async prepareChartData(
        chartConfig: ChartConfiguration, csvString: string, formatConfiguration: FormatConfiguration
    ): Promise<ChartConfiguration> {

        const colorConfig = await SysConfigService.getInstance().getUIConfiguration<DefaultColorConfiguration>(
            DefaultColorConfiguration.CONFIGURATION_ID
        );

        const csvFormatConfig = formatConfiguration as CSVFormatConfiguration;

        if (csvFormatConfig?.datasetProperties.length !== csvFormatConfig?.valueProperties?.length) {
            const error = await TranslationService.translate('Translatable#Incorrect data mapping. Length of dataset properties is different from value properties.', []);
            throw error;
        }

        const csvData = BrowserUtil.parseCSV(
            csvString, csvFormatConfig.textSeparator || '"', csvFormatConfig.valueSeparator || ','
        );

        let index = 0;
        if (csvData.length > 1 && csvData[index].length === 1 && csvData[1].length > 1) {
            index = 1;
        }

        const dataSetIndexes: Map<string, number> = new Map();
        for (const dsp of csvFormatConfig?.datasetProperties) {
            dataSetIndexes.set(dsp, csvData[index].findIndex((d) => d === dsp));
        }

        const valueIndexes: Map<string, number> = new Map();
        for (const vp of csvFormatConfig?.valueProperties) {
            valueIndexes.set(vp, csvData[index].findIndex((d) => d === vp));
        }

        const singleDataset = csvFormatConfig?.datasetProperties.length === 1 &&
            csvFormatConfig?.datasetProperties[0] === csvFormatConfig?.labelProperty;

        const labelIndex = csvData[index].findIndex((d) => d === csvFormatConfig?.labelProperty);

        const labels = [];
        let colorIndex = 0;
        for (let i = index + 1; i < csvData.length; i++) {

            const backgroundColor = colorConfig.defaultColors[colorIndex] || BrowserUtil.getRandomColor();

            const label = csvData[i][labelIndex];
            if (!labels.some((l) => l === label)) {
                const displayValue = await TranslationService.translate(label);
                labels.push(displayValue);
            }

            const labelValueIndex = labels.findIndex((l) => l === label);
            if (singleDataset) {
                if (!chartConfig.data.datasets.length) {
                    chartConfig.data.datasets = [{ data: [], backgroundColor: [] }];
                }

                const value = Number(csvData[i][valueIndexes.get(csvFormatConfig?.valueProperties[0])]);
                chartConfig.data.datasets[0].data.push(value);
                (chartConfig.data.datasets[0].backgroundColor as any).push(backgroundColor);
            } else {
                for (let j = 0; j < csvFormatConfig?.datasetProperties.length; j++) {
                    const value = Number(csvData[i][valueIndexes.get(csvFormatConfig?.valueProperties[j])]);

                    const dsLabel = csvData[i][dataSetIndexes.get(csvFormatConfig?.datasetProperties[j])];
                    let dataset = chartConfig.data.datasets.find((ds) => ds.label === dsLabel);
                    if (!dataset) {
                        dataset = { data: [], label: dsLabel, backgroundColor: backgroundColor };
                        chartConfig.data.datasets.push(dataset);
                    }

                    dataset.data[labelValueIndex] = value;
                }
            }

            colorIndex = (colorIndex === colorConfig.defaultColors.length - 1) ? 0 : colorIndex + 1;
        }

        chartConfig.data.labels = labels;

        return chartConfig;
    }

}