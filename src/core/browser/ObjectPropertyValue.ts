import { PropertyOperator } from "./PropertyOperator";
import { IdService } from "../browser";
import { KIXObject, KIXObjectType } from "../model";

export class ObjectPropertyValue {

    public constructor(
        public property: string,
        public operator: PropertyOperator,
        public value: string | number | string[] | number[] | KIXObject,
        public objectType: KIXObjectType = null,
        public readonly: boolean = false,
        public changeable: boolean = true,
        public id: string = IdService.generateDateBasedId('bulkvalue')
    ) { }

}
