import { FilterCriteria } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public displayCriteria: Array<[string, string, string]> = [],
        public title: string = null
    ) { }

}
