import { FilterCriteria } from "../../../../core/model";
import { Label } from "../../../../core/browser/components";

export class ComponentState {

    public constructor(
        public displayCriteria: Array<[string, string, Label[]]> = [],
        public title: string = null
    ) { }

}
