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

export class ConfigItemHistory extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_HISTORY;

    public HistoryEntryID: number;

    public UserID: number;

    public UserFirstname: string;

    public UserLastname: string;

    public UserLogin: string;

    public Comment: string;

    public ConfigItemID: number;

    public CreateBy: number;

    public CreateTime: string;

    public HistoryTypeID: number;

    public HistoryType: string;

    public VersionID: number;

    public constructor(configItemHistory?: ConfigItemHistory) {
        super();
        if (configItemHistory) {
            this.HistoryEntryID = configItemHistory.HistoryEntryID;
            this.ObjectId = this.HistoryEntryID;
            this.UserID = configItemHistory.UserID;
            this.UserFirstname = configItemHistory.UserFirstname;
            this.UserLastname = configItemHistory.UserLastname;
            this.UserLogin = configItemHistory.UserLogin;
            this.Comment = configItemHistory.Comment;
            this.ConfigItemID = configItemHistory.ConfigItemID;
            this.CreateBy = configItemHistory.CreateBy;
            this.CreateTime = configItemHistory.CreateTime;
            this.HistoryTypeID = configItemHistory.HistoryTypeID;
            this.HistoryType = configItemHistory.HistoryType;
            this.VersionID = Number(configItemHistory.VersionID);
        }
    }

    public equals(history: ConfigItemHistory): boolean {
        return this.HistoryEntryID === history.HistoryEntryID;
    }

    public getIdPropertyName(): string {
        return 'HistoryEntryID';
    }

}
