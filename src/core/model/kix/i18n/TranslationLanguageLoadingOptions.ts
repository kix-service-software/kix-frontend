import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class TranslationLanguageLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public constructor(
        public translationId: number
    ) {
        super();
    }

}
