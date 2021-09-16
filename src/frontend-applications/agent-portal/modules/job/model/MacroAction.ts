/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class MacroAction extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.MACRO_ACTION;

    public ID: number;

    public Type: string;

    public MacroID: number;

    public Parameters: any;

    public ResultVariables: any;

    public number: number;

    public constructor(macroAction?: MacroAction, number?: number) {
        super(macroAction);
        if (macroAction) {
            this.ObjectId = macroAction.ID;
            this.ID = macroAction.ID;
            this.Type = macroAction.Type;
            this.MacroID = macroAction.MacroID;
            this.Parameters = macroAction.Parameters;
            this.ResultVariables = macroAction.ResultVariables;
            this.number = number;
        }
    }

}
