import { ComponentState } from './ComponentState';
import {
    FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions, KIXObject, ObjectReferenceOptions
} from '../../../../../core/model';
import { FormService } from '../../../../../core/browser/form';
import { LabelService, KIXObjectService } from '../../../../../core/browser';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<string | number, ComponentState> {

    private objects: KIXObject[];

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
        this.state.searchCallback = this.search.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();

        await this.prepareNodes();
        await this.setCurrentNode();
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            const objectIds: any[] = Array.isArray(this.state.defaultValue.value)
                ? this.state.defaultValue.value : [this.state.defaultValue.value];

            const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
            if (objectOption) {
                const objects = await KIXObjectService.loadObjects(objectOption.value, objectIds);
                if (objects && !!objects.length) {
                    if (this.state.nodes && !!this.state.nodes.length) {
                        const nodes = this.state.nodes.filter(
                            (n) => objectIds.some((oid) => n.id.toString() === oid.toString())
                        );
                        if (nodes && !!nodes.length) {
                            this.state.currentNodes = nodes;
                        }
                    }

                    if (this.state.autocomplete) {
                        const nodes = [];
                        for (const object of objects) {
                            nodes.push(await this.createTreeNode(object));
                        }
                        this.state.nodes = nodes;
                        this.state.currentNodes = nodes;
                    }
                }
            }

            this.objectChanged(this.state.currentNodes);
        }
    }

    public objectChanged(nodes: TreeNode[]): void {
        this.state.currentNodes = nodes && nodes.length ? nodes : [];
        if (!!this.state.currentNodes.length) {
            super.provideValue(
                this.state.isMultiselect ? this.state.currentNodes.map((n) => n.id) : this.state.currentNodes[0].id
            );
        } else {
            super.provideValue(null);
        }
    }

    private async prepareNodes(): Promise<void> {
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const loadingOptions = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
        );
        if (objectOption) {
            this.setOptions();
            if (!this.state.autocomplete) {
                this.objects = await KIXObjectService.loadObjects(
                    objectOption.value, null, loadingOptions ? loadingOptions.value : null
                );
                for (const o of this.objects) {
                    const node = await this.createTreeNode(o);
                    this.state.nodes.push(node);
                }
            }
        }
    }

    private setOptions(): void {
        const autocompleteOption = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
        );
        this.state.autocomplete = typeof autocompleteOption === 'undefined'
            || autocompleteOption === null
            || autocompleteOption.value ? true : false;
        const isMultiselectOption = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.MULTISELECT
        );
        this.state.isMultiselect = typeof isMultiselectOption === 'undefined'
            || isMultiselectOption === null ? false : isMultiselectOption.value;
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        this.state.nodes = [];
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        if (objectOption) {
            if (this.state.autocomplete) {
                const objectType = objectOption.value as KIXObjectType;

                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
                this.objects = await KIXObjectService.loadObjects<KIXObject>(
                    objectType, null, loadingOptions, null, false
                );

                if (searchValue && searchValue !== '') {
                    this.state.nodes = [];
                    for (const o of this.objects) {
                        const node = await this.createTreeNode(o);
                        this.state.nodes.push(node);
                    }
                }
            }
        }

        return this.state.nodes;
    }

    private async createTreeNode(o: KIXObject): Promise<TreeNode> {
        const text = await LabelService.getInstance().getText(o);
        const icon = LabelService.getInstance().getIcon(o);
        return new TreeNode(o.ObjectId, text ? text : `${o.KIXObjectType}: ${o.ObjectId}`, icon);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
