import { InputDefinition } from "./InputDefinition";

export class AttributeDefinition {

    public Key: string;

    public Name: string;

    public Input: InputDefinition;

    public Searchable: boolean;

    public Sub: AttributeDefinition[];

    public CountMin: number;

    public CountMax: number;

    public CountDefault: number;

    public constructor(definition: AttributeDefinition) {
        if (definition) {
            this.Key = definition.Key;
            this.Name = definition.Name;
            this.Input = definition.Input;
            this.Searchable = definition.Searchable;
            this.CountMin = definition.CountMin;
            this.CountMax = definition.CountMax;
            this.CountDefault = definition.CountDefault;
            this.Sub = definition.Sub ? definition.Sub.map((s) => new AttributeDefinition(s)) : null;
        }
    }

}
