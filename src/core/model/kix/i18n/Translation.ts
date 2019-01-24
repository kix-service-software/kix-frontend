import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { TranslationLanguage } from "./TranslationLanguage";
import { SortUtil, SortOrder } from "../../sort";
import { TranslationProperty } from "./TranslationProperty";
import { DataType } from "../../DataType";
import { TranslationLanguageProperty } from "./TranslationLanguageProperty";

export class Translation extends KIXObject<Translation> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public ChangeBy: number;

    public ChangeTime: string;

    public CreateBy: number;

    public CreateTime: string;

    public ID: number;

    public Pattern: string;

    public Languages: TranslationLanguage[];

    public constructor(translation?: Translation) {
        super();
        if (translation) {
            this.ID = translation.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = translation.ChangeBy;
            this.ChangeTime = translation.ChangeTime;
            this.CreateBy = translation.CreateBy;
            this.CreateTime = translation.CreateTime;
            this.Pattern = translation.Pattern ? translation.Pattern : translation['Value'];

            let languages = translation.Languages
                ? translation.Languages.map((tl) => new TranslationLanguage(tl))
                : [];

            languages = SortUtil.sortObjects(
                languages, TranslationLanguageProperty.LANGUAGE, DataType.STRING, SortOrder.DOWN
            );

            this.Languages = languages;
        }
    }

    public equals(object: Translation): boolean {
        return this.ObjectId === object.ObjectId;
    }

}
