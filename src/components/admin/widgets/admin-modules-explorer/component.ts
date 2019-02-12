import { AbstractMarkoComponent, ContextService } from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { AdminContext } from '../../../../core/browser/admin';
import { TreeNode, AdminModuleCategory, AdminModule } from '../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        let catgeories = this.state.widgetConfiguration.settings;

        if (catgeories) {
            catgeories = catgeories.map((c) => new AdminModuleCategory(c));
            this.state.nodes = this.prepareCategoryTreeNodes(catgeories);
        }

        this.setActiveNode(context.adminModule);
    }

    private setActiveNode(adminModule: AdminModule): void {
        if (adminModule) {
            this.activeNodeChanged(this.getActiveNode(adminModule));
        }
    }

    private getActiveNode(adminModule: AdminModule, nodes: TreeNode[] = this.state.nodes): TreeNode {
        let activeNode = nodes.find((n) => n.id.id === adminModule.id);
        if (!activeNode) {
            for (let index = 0; index < nodes.length; index++) {
                activeNode = this.getActiveNode(adminModule, nodes[index].children);
                if (activeNode) {
                    nodes[index].expanded = true;
                    break;
                }
            }
        }
        return activeNode;
    }

    private prepareCategoryTreeNodes(categories: AdminModuleCategory[]): TreeNode[] {
        return categories
            ? categories.map((c) => new TreeNode(
                c, c.name, c.icon, null, [
                    ...this.prepareCategoryTreeNodes(c.children),
                    ...this.prepareModuleTreeNodes(c.modules)
                ], null, null, null, null, false, true, true)
            )
            : [];
    }

    private prepareModuleTreeNodes(modules: AdminModule[]): TreeNode[] {
        return modules.map((m) => new TreeNode(m, m.name, m.icon));
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        if (node.id instanceof AdminModule) {
            const adminModule = node.id as AdminModule;
            const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
            if (context) {
                context.setAdminModule(adminModule, node.parent ? node.parent.label : '');
            }
        }
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
    }

}

module.exports = Component;
