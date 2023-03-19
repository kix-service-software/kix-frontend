/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class Webform extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.WEBFORM;

    public buttonLabel: string;

    public title: string;

    public showTitle: boolean;

    public saveLabel: string;

    public hintMessage: string;

    public successMessage: string;

    public modal: boolean;

    public useKIXCSS: boolean;

    public allowAttachments: boolean;

    public acceptedDomains: string;

    public QueueID: number;

    public PrioritiyID: number;

    public TypeID: number;

    public StateID: number;

    public userLogin: string;

    public webformUserPassword: string;

    public constructor(
        webform?: Webform,
        buttonLabel?: string, title?: string, showTitle?: boolean, saveLabel?: string,
        hintMessage?: string, successMessage?: string, modal?: boolean, useKIXCSS?: boolean,
        allowAttachments?: boolean, acceptedDomains?: string, QueueID?: number, PrioritiyID?: number,
        TypeID?: number, StateID?: number, userLogin?: string, userPassword?: string, ValidID?: number
    ) {
        super(webform);
        if (webform) {
            this.ObjectId = webform.ObjectId;
            this.buttonLabel = webform.buttonLabel;
            this.title = webform.title;
            this.showTitle = webform.showTitle;
            this.saveLabel = webform.saveLabel;
            this.hintMessage = webform.hintMessage;
            this.successMessage = webform.successMessage;
            this.modal = webform.modal;
            this.useKIXCSS = webform.useKIXCSS;
            this.allowAttachments = webform.allowAttachments;
            this.acceptedDomains = this.prepareDomains(webform.acceptedDomains);
            this.QueueID = webform.QueueID;
            this.PrioritiyID = webform.PrioritiyID;
            this.TypeID = webform.TypeID;
            this.StateID = webform.StateID;
            this.userLogin = webform.userLogin;
            this.webformUserPassword = webform.webformUserPassword;
        } else {
            this.buttonLabel = buttonLabel;
            this.title = title;
            this.showTitle = showTitle;
            this.saveLabel = saveLabel;
            this.hintMessage = hintMessage;
            this.successMessage = successMessage;
            this.modal = modal;
            this.useKIXCSS = useKIXCSS;
            this.allowAttachments = allowAttachments;
            this.acceptedDomains = this.prepareDomains(acceptedDomains);
            this.QueueID = QueueID;
            this.PrioritiyID = PrioritiyID;
            this.TypeID = TypeID;
            this.StateID = StateID;
            this.userLogin = userLogin;
            this.webformUserPassword = userPassword;
            this.ValidID = ValidID;
        }
    }

    public getIdPropertyName(): string {
        return 'ObjectId';
    }

    private prepareDomains(domains: string | string[]): string {
        // prepare values of old implementation
        if (Array.isArray(domains)) {
            domains = domains.map((v) => v.replace(/\/(.+)\//, '$1'));
            domains = domains.length > 1 ? '(' + domains.join('|') + ')' : domains[0];
        }
        return domains;
    }
}
