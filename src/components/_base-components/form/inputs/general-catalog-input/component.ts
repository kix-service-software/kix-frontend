import {
    FormInputComponent, TreeNode, KIXObjectType, KIXObjectLoadingOptions,
    FilterCriteria, FilterDataType, FilterType, GeneralCatalogItem, ObjectIcon
} from '../../../../../core/model';
import { CompontentState } from './CompontentState';
import { SearchOperator, KIXObjectService } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<GeneralCatalogItem, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const classOption = this.state.field.options.find((o) => o.option === 'GC_CLASS');
        if (classOption) {
            const loadingOptions = new KIXObjectLoadingOptions(null, [new FilterCriteria(
                'Class', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, classOption.value.toString()
            )]);

            const items = await KIXObjectService.loadObjects<GeneralCatalogItem>(
                KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null, false
            );

            let hasIcon: boolean = false;
            const iconOption = this.state.field.options.find((o) => o.option === 'ICON');
            if (iconOption) {
                hasIcon = iconOption.value;
            }

            this.state.nodes = items.map((item) => new TreeNode(item.ItemID, item.Name, hasIcon
                ? new ObjectIcon(KIXObjectType.GENERAL_CATALOG_ITEM, item.ObjectId)
                : null));

            this.state.loading = false;
        } else {
            const error = await TranslationService.translate('Translatable#No general catalog class configured!');
            this.state.error = error;
        }
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const item = this.state.defaultValue.value as GeneralCatalogItem;
            this.state.currentNode = this.state.nodes.find((n) => item.ItemID === n.id);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
