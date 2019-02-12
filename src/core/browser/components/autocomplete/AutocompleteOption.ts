import { KIXObjectType } from "../../../model";

export class AutocompleteOption {

    public constructor(
        public objectType: KIXObjectType,
        public placeholder: string
    ) { }

}
