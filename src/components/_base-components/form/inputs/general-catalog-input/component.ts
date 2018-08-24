import {
    FormInputComponent, TreeNode, KIXObjectType, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, GeneralCatalogItem
} from "@kix/core/dist/model";
import { CompontentState } from "./CompontentState";
import { KIXObjectServiceRegistry, SearchOperator } from "@kix/core/dist/browser";
import { GeneralCatalogService } from "@kix/core/dist/browser/general-catalog";

class Component extends FormInputComponent<GeneralCatalogItem, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        super.onMount();

        const classOption = this.state.field.options.find((o) => o.option === 'GC_CLASS');
        if (classOption) {
            const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(
                KIXObjectType.GENERAL_CATALOG_ITEM
            ) as GeneralCatalogService;

            const loadingOptions = new KIXObjectLoadingOptions(null, [new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classOption.value.toString()
            )]);

            const items = await service.loadObjects(
                KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions
            );

            this.state.nodes = items.map((item) => new TreeNode(item, item.Name));
            this.state.loading = false;
        } else {
            this.state.error = 'No gc class configured!';
        }
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => this.state.defaultValue.value.equals(n.id));
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }
}

module.exports = Component;
