import { KIXObjectType } from "../../../model";

export class SearchResultCategory {

    public constructor(
        public label: string,
        public objectType: KIXObjectType,
        public children?: SearchResultCategory[],
        public objectIds: string[] | number[] = []
    ) { }

}
