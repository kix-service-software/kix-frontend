import { ComponentState } from './ComponentState';
import { ContextService, IdService, KIXObjectService } from '../../../../core/browser';
import {
    TreeNode, ConfigItemClass, KIXObjectType, TreeNodeProperty, ObjectIcon, KIXObjectLoadingOptions
} from '../../../../core/model';
import { CMDBContext } from '../../../../core/browser/cmdb';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';

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

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['ConfigItemStats']);
        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null, false
        );
        this.state.nodes = await this.prepareTreeNodes(ciClasses);

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

    private async prepareTreeNodes(configItemClasses: ConfigItemClass[]): Promise<TreeNode[]> {
        const nodes = [];
        if (configItemClasses) {
            for (const c of configItemClasses) {
                let count = '0';
                if (c.ConfigItemStats) {
                    count = (c.ConfigItemStats.PreProductiveCount + c.ConfigItemStats.ProductiveCount).toString();
                }

                const text = await TranslationService.translate('Translatable#Config Items Count: {0}', [count]);

                const properties = [new TreeNodeProperty(count, text)];
                const name = await TranslationService.translate(c.Name, []);
                nodes.push(new TreeNode(c, name, null, null, null, null, null, null, properties));
            }
        }
        return nodes;
    }

    public async activeNodeChanged(node: TreeNode): Promise<void> {
        this.state.activeNode = node;
        const ciClass = node.id as ConfigItemClass;
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        context.setAdditionalInformation('STRUCTURE', [ciClass.Name]);
        context.setCIClass(ciClass);
    }

    public async showAll(): Promise<void> {
        const context = await ContextService.getInstance().getContext<CMDBContext>(CMDBContext.CONTEXT_ID);
        this.state.activeNode = null;
        this.state.filterValue = null;
        const allText = await TranslationService.translate('Translatable#All');
        context.setAdditionalInformation('STRUCTURE', [allText]);
        context.setCIClass(null);

        (this as any).getComponent('ci-class-explorer-filter').reset();
    }

    public async filter(textFilterValue?: string): Promise<void> {
        this.state.filterValue = textFilterValue;
    }

}

module.exports = Component;
