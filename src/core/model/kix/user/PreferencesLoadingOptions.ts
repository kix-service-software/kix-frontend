import { KIXObjectSpecificLoadingOptions } from "../../KIXObjectSpecificLoadingOptions";

export class PreferencesLoadingOptions extends KIXObjectSpecificLoadingOptions {

    public static id = 'PreferencesLoadingOptions';

    public constructor(
        public userId: number
    ) {
        super();
    }

}
