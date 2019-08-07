/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../KIXObject";
import { KIXObjectType } from "../KIXObjectType";
import { TranslationLanguage } from "./TranslationLanguage";
import { SortUtil, SortOrder } from "../../sort";
import { DataType } from "../../DataType";
import { TranslationLanguageProperty } from "./TranslationLanguageProperty";

export class TranslationPattern extends KIXObject<TranslationPattern> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN;

    public ChangeBy: number;

    public ChangeTime: string;

    public CreateBy: number;

    public CreateTime: string;

    public ID: number;

    public Value: string;

    public Languages: TranslationLanguage[];

    public AvailableLanguages: string[];

    public constructor(translationPattern?: TranslationPattern) {
        super();
        if (translationPattern) {
            this.ID = translationPattern.ID;
            this.ObjectId = this.ID;
            this.ChangeBy = translationPattern.ChangeBy;
            this.ChangeTime = translationPattern.ChangeTime;
            this.CreateBy = translationPattern.CreateBy;
            this.CreateTime = translationPattern.CreateTime;
            this.Value = translationPattern.Value;
            this.AvailableLanguages = translationPattern.AvailableLanguages;

            let languages = translationPattern.Languages
                ? translationPattern.Languages.map((tl) => new TranslationLanguage(tl))
                : [];

            languages = SortUtil.sortObjects(
                languages, TranslationLanguageProperty.LANGUAGE, DataType.STRING, SortOrder.DOWN
            );

            this.Languages = languages;
        }
    }

    public equals(object: TranslationPattern): boolean {
        return this.ObjectId === object.ObjectId;
    }

}
