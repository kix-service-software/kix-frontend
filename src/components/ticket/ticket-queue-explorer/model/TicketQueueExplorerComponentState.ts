import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { TreeNode } from '@kix/core/dist/browser/model';

export class TicketQueueExplorerComponentState extends WidgetComponentState {
    public tree: TreeNode[] = [];
}
