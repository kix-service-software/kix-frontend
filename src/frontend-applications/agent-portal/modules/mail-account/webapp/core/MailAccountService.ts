/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { MailAccount } from '../../model/MailAccount';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MailAccountProperty } from '../../model/MailAccountProperty';
import { TreeNode } from '../../../base-components/webapp/core/tree';


export class MailAccountService extends KIXObjectService<MailAccount> {

    private static INSTANCE: MailAccountService = null;

    public static getInstance(): MailAccountService {
        if (!MailAccountService.INSTANCE) {
            MailAccountService.INSTANCE = new MailAccountService();
        }

        return MailAccountService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.MAIL_ACCOUNT);
        this.objectConstructors.set(KIXObjectType.MAIL_ACCOUNT, [MailAccount]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MAIL_ACCOUNT
            || kixObjectType === KIXObjectType.MAIL_ACCOUNT_TYPE;
    }

    public getLinkObjectName(): string {
        return 'MailAccount';
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
