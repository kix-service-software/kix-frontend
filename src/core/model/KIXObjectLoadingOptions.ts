import { FilterCriteria } from "./FilterCriteria";

export class KIXObjectLoadingOptions {

    public constructor(
        public properties?: string[],
        public filter?: FilterCriteria[],
        public sortOrder?: string,
        public searchValue?: string,
        public limit?: number,
        public includes?: string[],
        public expands?: string[],
        public query?: Array<[string, string]>
    ) { }

}
