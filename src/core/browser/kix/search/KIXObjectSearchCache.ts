import { KIXObjectType, FilterCriteria, KIXObject, CacheState } from "../../../model";

export class KIXObjectSearchCache<T extends KIXObject> {

    public constructor(
        public objectType: KIXObjectType,
        public criteria: FilterCriteria[],
        public result: T[],
        public fulltextValue: string = null,
        public status: CacheState = CacheState.VALID
    ) { }

}
