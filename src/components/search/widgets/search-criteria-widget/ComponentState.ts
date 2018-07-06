import { FilterCriteria } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public criterias: Array<[string, string, string]> = []
    ) { }

}
