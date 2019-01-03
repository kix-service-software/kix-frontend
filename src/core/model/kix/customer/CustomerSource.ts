import { CustomerSourceAttributeMapping } from "./CustomerSourceAttributeMapping";

export class CustomerSource {

    public ID: string;

    public Name: string;

    public ReadOnly: number;

    public AttributeMapping: CustomerSourceAttributeMapping[];

}
