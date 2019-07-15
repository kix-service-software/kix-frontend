import { TicketProperty, KIXObjectLoadingOptions } from "../../../model";
import { ChartConfiguration } from "chart.js";

export class TicketChartConfiguration {

    public constructor(
        public property: TicketProperty,
        public chartConfiguration: ChartConfiguration,
        public loadingOptions: KIXObjectLoadingOptions = null
    ) { }

}
