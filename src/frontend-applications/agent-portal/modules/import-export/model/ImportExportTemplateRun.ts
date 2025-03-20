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

export class ImportExportTemplateRun extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.IMPORT_EXPORT_TEMPLATE_RUN;

    public ObjectId: number;

    public ID: number;
    public TemplateID: number;
    public StateID: number;
    public State: string;
    public SuccessCount: number;
    public FailCount: number;
    public Type: string;
    public CreateBy: number;
    public StartTime: string;
    public EndTime: string;

    public listNumber: number;

    public constructor(templateRun?: ImportExportTemplateRun, number?: number) {
        super(templateRun);
        if (templateRun) {
            this.ID = Number(templateRun.ID);
            this.ObjectId = this.ID;
            this.TemplateID = Number(templateRun.TemplateID);
            this.StateID = templateRun.StateID ? Number(templateRun.StateID) : templateRun.StateID;
            this.State = templateRun.State;
            this.SuccessCount = templateRun.SuccessCount ? Number(templateRun.SuccessCount) : templateRun.SuccessCount;
            this.FailCount = templateRun.FailCount ? Number(templateRun.FailCount) : templateRun.FailCount;
            this.Type = templateRun.Type;
            this.CreateBy = templateRun.CreateBy;
            this.StartTime = templateRun.StartTime;
            this.EndTime = templateRun.EndTime;
            this.listNumber = number;
        }
    }

}
