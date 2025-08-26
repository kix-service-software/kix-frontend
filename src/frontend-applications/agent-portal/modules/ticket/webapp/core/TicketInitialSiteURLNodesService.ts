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