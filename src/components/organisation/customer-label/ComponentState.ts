import { ILabelProvider } from "../../../core/browser";
import { Organisation, Contact } from "../../../core/model";

export class ComponentState {

    public constructor(
        public labelProvider: ILabelProvider<Organisation | Contact> = null,
        public property: string = null,
        public object: Organisation | Contact = null,
        public propertyText: string = null,
        public displayText: string = null,
        public title: string = null
    ) { }

}
