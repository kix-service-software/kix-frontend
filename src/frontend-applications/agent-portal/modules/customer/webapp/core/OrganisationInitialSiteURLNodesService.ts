import { ExtendedInitialSiteURLNodesService } from '../../../base-components/webapp/core/ExtendedInitialSiteURLNodesService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class OrganisationInitialSiteURLNodesService extends ExtendedInitialSiteURLNodesService {

    public constructor() {
        super();
    }

    public async getInitialSiteURLNodes(): Promise<TreeNode[]> {
        const label = await TranslationService.translate('Translatable#Organizations and Contacts View');
        return [new TreeNode('organisations', label, 'kix-icon-organisation')];
    }

}