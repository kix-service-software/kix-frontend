/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TranslationLanguage } from './TranslationLanguage';
import { TranslationLanguageProperty } from './TranslationLanguageProperty';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { SortUtil } from '../../../model/SortUtil';
import { DataType } from '../../../model/DataType';
import { SortOrder } from '../../../model/SortOrder';

export class TranslationPattern extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.TRANSLATION_PATTERN;

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
