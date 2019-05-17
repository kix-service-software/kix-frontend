import { ComponentState } from "./ComponentState";
import {
    ObjectIcon, TreeNode, FormInputComponent, KIXObjectType,
    FilterCriteria, FilterDataType, FilterType, KIXObjectLoadingOptions, FormFieldOptions
} from "../../../../../core/model";
import { FAQCategory, FAQCategoryProperty } from "../../../../../core/model/kix/faq";
import { KIXObjectService, SearchOperator } from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { FAQService } from "../../../../../core/browser/faq";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        const validOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;

        const showInvalid = validOption ? validOption.value : false;

        const nodes = await FAQService.getInstance().getTreeNodes(FAQCategoryProperty.PARENT_ID, showInvalid);

        this.state.nodes = nodes;
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const node = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            this.state.currentNodes = node ? [node] : [];
            super.provideValue(
                this.state.currentNodes && this.state.currentNodes.length
                    ? this.state.currentNodes[0].id
                    : null
            );
        }
    }

    public categoryChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes && nodes;
        super.provideValue(
            this.state.currentNodes && this.state.currentNodes.length
                ? this.state.currentNodes[0].id
                : null
        );
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
