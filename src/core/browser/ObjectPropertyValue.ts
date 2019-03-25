import { PropertyOperator } from "./PropertyOperator";
import { IdService } from "../browser";
import { KIXObject, KIXObjectType } from "../model";
import { ImportPropertyOperator } from "./import";

export class ObjectPropertyValue {

    public constructor(
        public property: string,
        public operator: PropertyOperator | ImportPropertyOperator,
        public value: string | number | string[] | number[] | KIXObject | any,
        public objectType: KIXObjectType = null,
        public readonly: boolean = false,
        public changeable: boolean = true,
        public id: string = IdService.generateDateBasedId('value-')
    ) { }

}
