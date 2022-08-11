/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class CSVChartDataMapper implements IReportChartDataMapper {

    public async prepareChartData(
        chartConfig: ChartConfiguration, csvString: string, formatConfiguration: FormatConfiguration
    ): Promise<ChartConfiguration> {
        const csvFormatConfig = formatConfiguration as CSVFormatConfiguration;

        if (csvFormatConfig?.datasetProperties.length !== csvFormatConfig?.valueProperties?.length) {
            const error = await TranslationService.translate('Translatable#Incorrect data mapping. Length of dataset properties is different from value properties.', []);
            throw error;
        }

        const csvData = BrowserUtil.parseCSV(
            csvString, csvFormatConfig.textSeparator || '"', csvFormatConfig.valueSeparator || ','
        );

        const dataSetIndexes: Map<string, number> = new Map();
        for (const dsp of csvFormatConfig?.datasetProperties) {
            dataSetIndexes.set(dsp, csvData[0].findIndex((d) => d === dsp));
        }

        const valueIndexes: Map<string, number> = new Map();
        for (const vp of csvFormatConfig?.valueProperties) {
            valueIndexes.set(vp, csvData[0].findIndex((d) => d === vp));
        }

        const singleDataset = csvFormatConfig?.datasetProperties.length === 1 &&
            csvFormatConfig?.datasetProperties[0] === csvFormatConfig?.labelProperty;

        const labelIndex = csvData[0].findIndex((d) => d === csvFormatConfig?.labelProperty);

        const labels = [];
        for (let i = 1; i < csvData.length; i++) {
            const label = csvData[i][labelIndex];
            if (!labels.some((l) => l === label)) {
                labels.push(label);
            }

            const labelValueIndex = labels.findIndex((l) => l === label);
            if (singleDataset) {
                if (!chartConfig.data.datasets.length) {
                    chartConfig.data.datasets = [{ data: [], backgroundColor: [] }];
                }

                const value = Number(csvData[i][valueIndexes.get(csvFormatConfig?.valueProperties[0])]);
                chartConfig.data.datasets[0].data.push(value);
                (chartConfig.data.datasets[0].backgroundColor as any).push(BrowserUtil.getRandomColor());
            } else {
                for (let j = 0; j < csvFormatConfig?.datasetProperties.length; j++) {
                    const value = Number(csvData[i][valueIndexes.get(csvFormatConfig?.valueProperties[j])]);

                    const dsLabel = csvData[i][dataSetIndexes.get(csvFormatConfig?.datasetProperties[j])];
                    let dataset = chartConfig.data.datasets.find((ds) => ds.label === dsLabel);
                    if (!dataset) {
                        dataset = { data: [], label: dsLabel, backgroundColor: BrowserUtil.getRandomColor() };
                        chartConfig.data.datasets.push(dataset);
                    }

                    dataset.data[labelValueIndex] = value;
                }

            }
        }

        chartConfig.data.labels = labels;

        return chartConfig;
    }

}