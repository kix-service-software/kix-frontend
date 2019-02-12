import {
    ConfigItemProperty, ConfigItem, KIXObjectType, ConfigItemClass, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, GeneralCatalogItem
} from "../../../model";
import { LabelService } from "../../LabelService";
import { SearchOperator } from "../../SearchOperator";
import { ChartDataSets } from "chart.js";
import { KIXObjectService } from "../../kix";

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
        property: ConfigItemProperty, configItems: ConfigItem[]
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
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM);

        const loadingOptions = new KIXObjectLoadingOptions(null, [
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
                    backgroundColor: "#ffed00"
                },
                {
                    label: 'Incident',
                    data: [],
                    backgroundColor: "#e31e24"
                }
            ];

            const incidentClasses = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
            );
            for (const c of configItems) {
                const incidentClass = incidentClasses.find((ic) => ic.ItemID === c.CurInciStateID);
                if (incidentClass) {
                    const label = await labelProvider.getPropertyValueDisplayText(property, c.ClassID);
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
        } else {
            result[1] = [{
                data: []
            }];
            for (const c of configItems) {
                if (c[property]) {
                    const label = await labelProvider.getPropertyValueDisplayText(property, c[property]);

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

    private getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    private getPredefinedColors(): string[] {
        return [
            "rgb(91,91,91)",
            "rgb(4,82,125)",
            "rgb(0,141,210)",
            "rgb(129,189,223)",
            "rgb(160,230,200)",
            "rgb(130,200,38)",
            "rgb(0,152,70)",
            "rgb(227,30,36)",
            "rgb(239,127,26)",
            "rgb(254,204,0)"
        ];
    }

}
