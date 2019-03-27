import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";

export class TranslationLanguage extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType.TRANSLATION_LANGUAGE;

    public TranslationID: number;

    public Language: string;

    public Value: string;

    public constructor(translationLanguage?: TranslationLanguage) {
        super();
        if (translationLanguage) {
            this.Language = translationLanguage.Language;
            this.ObjectId = this.Language;
            this.TranslationID = translationLanguage.TranslationID;
            this.Value = translationLanguage.Value;
        }
    }

    public equals(translationLanguage: TranslationLanguage): boolean {
        return this.ObjectId === translationLanguage.ObjectId;
    }

    public toString(): string {
        return this.Language;
    }

}
