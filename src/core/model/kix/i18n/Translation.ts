import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class Translation extends KIXObject<Translation> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public Pattern: string;

    public Languages: any;

    public constructor(translation?: Translation) {
        super(translation);
        if (translation) {
            this.ObjectId = translation.Pattern;
            this.Pattern = translation.Pattern;
            this.Languages = translation.Languages;
        }
    }

}
