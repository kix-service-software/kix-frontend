/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TranslationLanguage extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType.TRANSLATION_LANGUAGE;

    public PatternID: number;

    public Language: string;

    public Value: string;

    public constructor(translationLanguage?: TranslationLanguage) {
        super();
        if (translationLanguage) {
            this.Language = translationLanguage.Language;
            this.ObjectId = this.Language;
            this.PatternID = translationLanguage.PatternID;
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
