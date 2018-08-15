import { IdService } from "@kix/core/dist/browser";
import { ChartConfiguration } from "chart.js";

export class ComponentState {

    public constructor(
        public chartId: string = IdService.generateDateBasedId()
    ) { }

}
