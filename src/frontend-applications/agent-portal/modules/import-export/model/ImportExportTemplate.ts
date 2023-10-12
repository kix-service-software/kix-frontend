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
import { ImportExportTemplateRun } from './ImportExportTemplateRun';

export class ImportExportTemplate extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE;

    public ObjectId: string | number;

    public ID: string | number;
    public Name: string;
    public Format: string;
    public Object: string;
    public Number: string;
    public Runs: ImportExportTemplateRun[];
    public ObjectData: any;

    public constructor(template?: ImportExportTemplate) {
        super(template);
        if (template) {
            this.ID = template.ID;
            this.ObjectId = this.ID;
            this.Name = template.Name;
            this.Format = template.Format;
            this.Object = template.Object;
            this.Number = template.Number;
            this.Runs = template.Runs ? template.Runs.map((r, i) => new ImportExportTemplateRun(r, ++i)) : [];
            this.ObjectData = template.ObjectData ? template.ObjectData : {};
        }
    }

}
