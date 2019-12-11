/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";

export class ImportExportTemplate extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE;

    public ObjectId: string | number;

    public ID: string | number;
    public Name: string;
    public Format: string;
    public Object: string;
    public Number: string;

    public constructor(template?: ImportExportTemplate) {
        super(template);
        if (template) {
            this.ID = template.ID;
            this.ObjectId = this.ID;
            this.Name = template.Name;
            this.Format = template.Format;
            this.Object = template.Object;
            this.Number = template.Number;
        }
    }

}