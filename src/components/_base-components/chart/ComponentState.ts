import { IdService } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public chartId: string = IdService.generateDateBasedId(),
        public loading: boolean = false
    ) { }

}
