/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class ReportParameter {

    public Name: string;

    public Label: string;

    public Description: string;

    public Default: string;

    public DataType: string;

    public References: string;

    public Multiple: number;

    public ReadOnly: number;

    public Required: number;

    public PossibleValues: any[];

}