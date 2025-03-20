/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class MacroActionType extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.MACRO_ACTION_TYPE;

    public Name: string;

    public DisplayName: string;

    public Description: string;

    public MacroType: string;

    public Options: any;

    public Results: any;

    public constructor(macroActionType?: MacroActionType) {
        super(macroActionType);
        if (macroActionType) {
            this.ObjectId = macroActionType.Name;
            this.Name = macroActionType.Name;
            this.DisplayName = macroActionType.DisplayName;
            this.Description = macroActionType.Description;
            this.MacroType = macroActionType.MacroType;
            this.Options = macroActionType.Options;
            this.Results = macroActionType.Results;
        }
    }

    public getIdPropertyName(): string {
        return 'Name';
    }

}
