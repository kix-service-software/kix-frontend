import { ComponentState } from './ComponentState';
import { ContextService, IdService } from '@kix/core/dist/browser';
import { TreeNode, ConfigItemClass, KIXObjectType } from '@kix/core/dist/model';
import { CMDBContext } from '@kix/core/dist/browser/cmdb';

export class Component {

    private state: ComponentState;

    public listenerId: string;

    public textFilterValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
        this.listenerId = IdService.generateDateBasedId('search-result-explorer-');
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const ciClasses = await ContextService.getInstance().loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, null
        );
        this.state.nodes = this.prepareTreeNodes(ciClasses);

        if (context.currentCIClass) {
            this.setActiveNode(context.currentCIClass);
        } else {
            this.showAll();
        }
    }

    private setActiveNode(category: ConfigItemClass): void {
        if (category) {
            this.state.activeNode = this.getActiveNode(category);
        }
    }

    private getActiveNode(category: ConfigItemClass, nodes: TreeNode[] = this.state.nodes
    ): TreeNode {
        let activeNode = nodes.find((n) => n.id.ID === category.ID);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(category, nodes[index].children);
                if (activeNode) {
                    nodes[index].expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private prepareTreeNodes(categories: ConfigItemClass[]): TreeNode[] {
        return categories
            ? categories.map((c) => new TreeNode(c, c.Name, null, null, null))
            : [];
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        const ciClass = node.id as ConfigItemClass;
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        context.setAdditionalInformation([ciClass.Name]);
        context.setCIClass(ciClass);
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        this.state.activeNode = null;
        this.state.filterValue = null;
        context.setAdditionalInformation(['Alle']);
        context.setCIClass(null);
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
    }

}

module.exports = Component;
