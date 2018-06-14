import { ILabelProvider } from "@kix/core/dist/browser";
import { Customer, Contact } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public labelProvider: ILabelProvider<Customer | Contact> = null,
        public property: string = null,
        public object: Customer | Contact = null,
        public propertyText: string = null,
        public displayText: string = null,
        public title: string = null
    ) { }

}
