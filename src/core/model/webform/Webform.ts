/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject, KIXObjectType } from "../kix";

export class Webform extends KIXObject<Webform> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.WEBFORM;

    public ButtonLabel: string;

    public Title: string;

    public showTitle: boolean;

    public saveLabel: string;

    public hintMessage: string;

    public successMessage: string;

    public modal: boolean;

    public useKIXCSS: boolean;

    public allowAttachments: boolean;

    public QueueID: number;

    public PrioritiyID: number;

    public TypeID: number;

    public StateID: number;

    public UserID: number;

    public constructor(
        webform?: Webform,
        ButtonLabel?: string, Title?: string, showTitle?: boolean, saveLabel?: string,
        hintMessage?: string, successMessage?: string, modal?: boolean, useKIXCSS?: boolean,
        allowAttachments?: boolean, QueueID?: number, PrioritiyID?: number,
        TypeID?: number, StateID?: number, UserID?: number, ValidID?: number
    ) {
        super(webform);
        if (webform) {
            this.ObjectId = webform.ObjectId;
            this.ButtonLabel = webform.ButtonLabel;
            this.Title = webform.Title;
            this.showTitle = webform.showTitle;
            this.saveLabel = webform.saveLabel;
            this.hintMessage = webform.hintMessage;
            this.successMessage = webform.successMessage;
            this.modal = webform.modal;
            this.useKIXCSS = webform.useKIXCSS;
            this.allowAttachments = webform.allowAttachments;
            this.QueueID = webform.QueueID;
            this.PrioritiyID = webform.PrioritiyID;
            this.TypeID = webform.TypeID;
            this.StateID = webform.StateID;
            this.UserID = webform.UserID;
        } else {
            this.ButtonLabel = ButtonLabel;
            this.Title = Title;
            this.showTitle = showTitle;
            this.saveLabel = saveLabel;
            this.hintMessage = hintMessage;
            this.successMessage = successMessage;
            this.modal = modal;
            this.useKIXCSS = useKIXCSS;
            this.allowAttachments = allowAttachments;
            this.QueueID = QueueID;
            this.PrioritiyID = PrioritiyID;
            this.TypeID = TypeID;
            this.StateID = StateID;
            this.UserID = UserID;
            this.ValidID = ValidID;
        }
    }
}
