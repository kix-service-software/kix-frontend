/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../model/kix/KIXObject';

export class MacroType extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.MACRO_TYPE;

    public Name: string;

    public DisplayName: string;

    public Type: string;

    public constructor(macroType?: MacroType) {
        super(macroType);
        if (macroType) {
            this.ObjectId = macroType.Name;
            this.Name = macroType.Name;
            this.DisplayName = macroType.DisplayName;
            this.Type = macroType.Name;
        }
    }

    public getIdPropertyName(): string {
        return 'Name';
    }

}
