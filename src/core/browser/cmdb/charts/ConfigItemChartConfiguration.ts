import { ConfigItemProperty } from "../../../model";
import { ChartConfiguration } from "chart.js";

export class ConfigItemChartConfiguration {

    public constructor(
        public property: ConfigItemProperty,
        public chartConfiguration: ChartConfiguration
    ) { }

}
