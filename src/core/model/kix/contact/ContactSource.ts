import { ContactSourceAttributeMapping } from "./ContactSourceAttributeMapping";

export class ContactSource {

    public ID: string;

    public Name: string;

    public ReadOnly: number;

    public AttributeMapping: ContactSourceAttributeMapping[];

}
