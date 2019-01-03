import { IdService } from "../../../core/browser";

export class ComponentState {

    public constructor(
        public chartId: string = IdService.generateDateBasedId(),
        public loading: boolean = false
    ) { }

}
