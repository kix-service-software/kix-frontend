/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class Translation extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.TRANSLATION;

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
