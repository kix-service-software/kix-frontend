/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class MacroActionTypeOption {

    public Name: string;

    public Description: string;

    public Required: number;

    public Label: string;

    public Order: number;

    public PossibleValues: any[];

    public DefaultValue: any;

    public constructor(macroActionType?: MacroActionTypeOption) {
        if (macroActionType) {
            this.Name = macroActionType.Name;
            this.Description = macroActionType.Description;
            this.Required = macroActionType.Required;
            this.Label = macroActionType.Label;
            this.Order = macroActionType.Order;
            this.PossibleValues = macroActionType.PossibleValues;
            this.DefaultValue = macroActionType.DefaultValue;
        }
    }

}
