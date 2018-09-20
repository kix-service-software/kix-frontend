import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser';
import { TreeNode, Bookmark } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.bookmarks = objectData.bookmarks.map(
                (b) => new TreeNode(b, b.title, b.icon)
            );
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        if (nodes && nodes.length) {
            const bookmark = nodes[0].id as Bookmark;
            ContextService.getInstance().setContext(bookmark.contextId, bookmark.objectType, null, bookmark.objectID);
            const component = (this as any).getComponent("bookmarks-dropdown");
            if (component) {
                component.clear();
            }
        }
    }

}

module.exports = Component;
