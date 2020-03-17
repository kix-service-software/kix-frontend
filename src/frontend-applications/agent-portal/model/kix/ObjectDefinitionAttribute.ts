/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DataType } from "../DataType";
import { KIXObjectType } from "./KIXObjectType";

export class ObjectDefinitionAttribute {

    public constructor(
        public Name: string = null,
        public Datatype: DataType = null,
        public PossibleValues: any[],
        public ReferencedObject: KIXObjectType | string,
        public ReadOnly: boolean
    ) { }
}
