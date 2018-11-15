import { FilterCriteria } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

export class ComponentState {

    public constructor(
        public displayCriteria: Array<[string, string, Label[]]> = [],
        public title: string = null
    ) { }

}
