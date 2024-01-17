/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { DispatchingType } from '../../model/DispatchingType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';


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
            case MailAccountProperty.DISPATCHING_BY:
                const translations = await TranslationService.createTranslationObject([
                    'Translatable#Default Queue (SysConfig)',
                    'Translatable#recipient adresses (To, Cc, etc.)',
                    'Translatable#Queue'
                ]);
                nodes = [
                    new TreeNode(
                        DispatchingType.BACKEND_KEY_DEFAULT,
                        translations['Translatable#Default Queue (SysConfig)']
                    ),
                    new TreeNode(
                        DispatchingType.BACKEND_KEY_FROM,
                        translations['Translatable#recipient adresses (To, Cc, etc.)']
                    ),
                    new TreeNode(
                        DispatchingType.BACKEND_KEY_QUEUE,
                        translations['Translatable#Queue']
                    )
                ];
                break;
            default:
        }

        return nodes;
    }

}
