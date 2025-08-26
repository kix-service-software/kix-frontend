/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ExtendedInitialSiteURLNodesService } from '../../../base-components/webapp/core/ExtendedInitialSiteURLNodesService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class TicketInitialSiteURLNodesService extends ExtendedInitialSiteURLNodesService {

    public constructor() {
        super();
    }

    public async getInitialSiteURLNodes(): Promise<TreeNode[]> {
        const label = await TranslationService.translate('Translatable#Team View');
        return [new TreeNode('tickets', label, 'kix-icon-ticket')];
    }

}