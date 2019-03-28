import { ComponentState } from './ComponentState';
import { ContextService } from '../../core/browser';
import { TreeNode, Bookmark } from '../../core/model';
import { ObjectDataService } from '../../core/browser/ObjectDataService';
import { TranslationService } from '../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const objectData = ObjectDataService.getInstance().getObjectData();

        this.state.placeholder = await TranslationService.translate('Translatable#Bookmarks');

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
