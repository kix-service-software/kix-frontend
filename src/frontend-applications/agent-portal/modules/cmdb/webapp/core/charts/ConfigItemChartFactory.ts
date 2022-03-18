/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { ConfigItem } from '../../../model/ConfigItem';
import { ChartDataSets } from 'chart.js';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { GeneralCatalogItem } from '../../../../general-catalog/model/GeneralCatalogItem';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

export class ConfigItemChartFactory {

    private static INSTANCE: ConfigItemChartFactory;

    public static getInstance(): ConfigItemChartFactory {
        if (!ConfigItemChartFactory.INSTANCE) {
            ConfigItemChartFactory.INSTANCE = new ConfigItemChartFactory();
        }
        return ConfigItemChartFactory.INSTANCE;
    }

    private constructor() { }

    public async prepareData(
        property: ConfigItemProperty, configItems: ConfigItem[] = []
    ): Promise<[string[], ChartDataSets[]]> {
        switch (property) {
            case ConfigItemProperty.CLASS_ID:
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                return await this.preparePropertyCountData(property, configItems);
            default:
                return [[], []];
        }
    }

    private async preparePropertyCountData(
        property: ConfigItemProperty, configItems: ConfigItem[]
    ): Promise<[string[], ChartDataSets[]]> {
        if (!configItems) {
            configItems = [];
        }

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'ITSM::Core::IncidentState'
            ),
            new FilterCriteria(
                'Name', SearchOperator.IN, FilterDataType.STRING, FilterType.AND, ['Incident', 'Warning']
            )
        ]);

        const result: [string[], ChartDataSets[]] = [[], []];

        if (property === ConfigItemProperty.CUR_INCI_STATE_ID) {
            result[1] = [
                {
                    label: 'Warning',
                    data: [],
                    backgroundColor: '#ffed00'
                },
                {
                    label: 'Incident',
                    data: [],
                    backgroundColor: '#e31e24'
                }
            ];

            const incidentClasses = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
            );
            for (const c of configItems) {
                const incidentClass = incidentClasses.find((ic) => ic.ItemID === c.CurInciStateID);
                if (incidentClass) {
                    const label = await LabelService.getInstance().getPropertyValueDisplayText(
                        KIXObjectType.CONFIG_ITEM, property, c.ClassID
                    );
                    if (!result[0].some((l) => l === label)) {
                        result[0].push(label);
                    }

                    const index = result[0].findIndex((l) => l === label);
                    const dataIndex = result[1].findIndex((r) => r.label === incidentClass.Name);
                    if (dataIndex !== -1) {
                        if (!result[1][dataIndex].data[index]) {
                            result[1][dataIndex].data[index] = 0;
                        }

                        const value = Number(result[1][dataIndex].data[index]);
                        result[1][dataIndex].data[index] = value + 1;
                    }
                }
            }

            const labelWarning = await TranslationService.translate('Translatable#Warning');
            const labelIncident = await TranslationService.translate('Translatable#Incident');
            result[1][0].label = labelWarning;
            result[1][1].label = labelIncident;
        } else {
            result[1] = [{
                data: []
            }];
            for (const c of configItems) {
                if (c[property]) {
                    const label = await LabelService.getInstance().getPropertyValueDisplayText(
                        KIXObjectType.CONFIG_ITEM, property, c[property], undefined, c
                    );

                    if (!result[0].some((l) => l === label)) {
                        result[0].push(label);
                    }

                    const index = result[0].findIndex((l) => l === label);
                    if (!result[1][0].data[index]) {
                        result[1][0].data[index] = 0;
                    }

                    const value = Number(result[1][0].data[index]);
                    result[1][0].data[index] = value + 1;
                }
            }

            result[1][0].backgroundColor = this.getPredefinedColors();
        }

        return result;
    }

    private getPredefinedColors(): string[] {
        return [
            'rgb(91,91,91)',
            'rgb(4,82,125)',
            'rgb(0,141,210)',
            'rgb(129,189,223)',
            'rgb(160,230,200)',
            'rgb(130,200,38)',
            'rgb(0,152,70)',
            'rgb(227,30,36)',
            'rgb(239,127,26)',
            'rgb(254,204,0)'
        ];
    }

}
