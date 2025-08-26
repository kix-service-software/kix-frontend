import { ExtendedInitialSiteURLNodesService } from '../../../base-components/webapp/core/ExtendedInitialSiteURLNodesService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class KanbanInitialSiteURLNodesService extends ExtendedInitialSiteURLNodesService {

    public constructor() {
        super();
    }

    public async getInitialSiteURLNodes(): Promise<TreeNode[]> {
        const label = await TranslationService.translate('Translatable#Personal Kanban Board');
        return [new TreeNode('kanban', label, 'kix-icon-kanban')];
    }

}