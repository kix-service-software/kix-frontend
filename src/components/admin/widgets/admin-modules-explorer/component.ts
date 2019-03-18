import { AbstractMarkoComponent, ContextService } from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import { AdminContext } from '../../../../core/browser/admin';
import { TreeNode, AdminModuleCategory, AdminModule } from '../../../../core/model';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

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
        let categories = this.state.widgetConfiguration.settings;

        if (categories) {
            categories = categories.map((c) => new AdminModuleCategory(c));
            this.state.nodes = await this.prepareCategoryTreeNodes(categories);
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

    private async prepareCategoryTreeNodes(categories: AdminModuleCategory[]): Promise<TreeNode[]> {
        const nodes = [];
        if (categories) {
            for (const c of categories.sort((a, b) => a.id.localeCompare(b.id))) {
                const categoryTreeNodes = await this.prepareCategoryTreeNodes(c.children);
                const moduleTreeNodes = await this.prepareModuleTreeNodes(c.modules);
                const name = await TranslationService.translate(c.name);
                nodes.push(new TreeNode(
                    c, name, c.icon, null, [
                        ...categoryTreeNodes,
                        ...moduleTreeNodes
                    ], null, null, null, null, false, true, true)
                );
            }
        }
        return nodes;
    }

    private async prepareModuleTreeNodes(modules: AdminModule[]): Promise<TreeNode[]> {
        const nodes = [];
        for (const m of modules) {
            const name = await TranslationService.translate(m.name);
            nodes.push(new TreeNode(m, name, m.icon));
        }

        return nodes;
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
