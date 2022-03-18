/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class DynamicFieldValue {

    public ID: string;
    public Name: string;
    public Label: string;
    public Value: string[];
    public PreparedValue: string[];
    public DisplayValue: string;
    public DisplayValueHTML: string;
    public DisplayValueShort: string;

    public constructor(value?: DynamicFieldValue) {
        if (value) {
            this.ID = value.ID;
            this.Name = value.Name;
            this.Label = value.Label;
            this.Value = value.Value;
            this.PreparedValue = value.PreparedValue;
            this.DisplayValue = value.DisplayValue;
            this.DisplayValueHTML = value.DisplayValueHTML;
            this.DisplayValueShort = value.DisplayValueShort;
        }
    }

}
