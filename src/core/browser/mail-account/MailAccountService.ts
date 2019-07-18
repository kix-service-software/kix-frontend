/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { MailAccount, KIXObjectType, MailAccountProperty, TreeNode } from "../../model";

export class MailAccountService extends KIXObjectService<MailAccount> {

    private static INSTANCE: MailAccountService = null;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }

        return MailAccountService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.MAIL_ACCOUNT
            || kixObjectType === KIXObjectType.MAIL_ACCOUNT_TYPE;
    }

    public getLinkObjectName(): string {
        return 'MailAccount';
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case MailAccountProperty.TRUSTED:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }

    public async getTreeNodes(property: string, showInvalid: boolean = false): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case MailAccountProperty.TYPE:
                const types = await this.loadObjects(KIXObjectType.MAIL_ACCOUNT_TYPE, null);
                nodes = types ? types.map((t) => new TreeNode(t, t.toString())) : [];
                break;
            default:
        }

        return nodes;
    }

}
