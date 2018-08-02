import { FilterCriteria } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public displayCriterias: Array<[string, string, string]> = [],
        public title: string = null
    ) { }

}
