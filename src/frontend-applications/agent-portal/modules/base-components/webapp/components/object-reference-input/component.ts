/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TreeNode, TreeService, TreeHandler, TreeUtil } from '../../core/tree';
import { ObjectReferenceOptions } from '../../../../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { UIUtil } from '../../core/UIUtil';
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { ContextService } from '../../core/ContextService';
import { ObjectReferenceUtil } from './ObjectReferenceUtil';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';

class Component extends FormInputComponent<string | number | string[] | number[], ComponentState> {

    private objects: KIXObject[];
    private formSubscriber: IEventSubscriber;

    // field options
    private showInvalidNodes: boolean;
    private isInvalidClickable: boolean;
    private useTextAsId: boolean;
    private objectType: KIXObjectType | string;
    private loadingOptions: KIXObjectLoadingOptions;
    private specificLoadingOptions: KIXObjectSpecificLoadingOptions;
    private objectIds: Array<string | number>;
    private autocomplete: boolean = false;
    private translatable: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);

        (this as any).setStateDirty('field');
    }

    public async onMount(): Promise<void> {
        this.setOptions();
        const treeHandler = new TreeHandler([], null, null, this.state.multiselect);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();
        this.state.searchCallback = this.search.bind(this);

        this.formSubscriber = {
            eventSubscriberId: this.state.field?.instanceId,
            eventPublished: (data: any, eventId: string): void => {
                if (data.formField && data.formField.instanceId === this.state.field?.instanceId) {
                    this.load(false);
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.RELOAD_INPUT_VALUES, this.formSubscriber);

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        const objects = await ObjectReferenceUtil.searchObjects(limit, searchValue, this.state.field?.options);
        const nodes = await ObjectReferenceUtil.createTreeNodes(
            objects, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId, this.state.field?.options
        );
        return nodes;
    }

    private async load(preload: boolean = true): Promise<void> {
        let nodes = [];

        if (!this.autocomplete) {
            nodes = await this.loadNodes().catch(() => []);
        }

        const additionalNodes = await this.loadAdditionalNodes().catch(() => []);
        nodes = [...nodes, ...additionalNodes];

        if (preload) {
            const preloadedNodes = await this.preloadNodes().catch(() => []);
            nodes = [...preloadedNodes, ...nodes];
        }

        this.createTreeHandler(nodes);
    }

    private async loadNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        this.objects = await KIXObjectService.loadObjects(this.objectType, this.objectIds, this.loadingOptions);
        const structureOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
        );

        const objectId = await UIUtil.getEditObjectId(this.objectType);

        const translatableOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        const translatable = !translatableOption || Boolean(translatableOption.value);

        if (structureOption && structureOption.value) {
            nodes = await KIXObjectService.prepareObjectTree(
                this.objects, this.showInvalidNodes, this.isInvalidClickable, objectId ? [objectId] : null, translatable
            );
        } else {
            for (const o of this.objects) {
                const node = await ObjectReferenceUtil.createTreeNode(
                    o, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId,
                    translatable, objectId ? [objectId] : undefined
                );
                if (node) {
                    nodes.push(node);
                }
            }
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    private async loadAdditionalNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const additionalNodes = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.ADDITIONAL_NODES
        );
        if (additionalNodes) {
            for (const node of (additionalNodes.value as TreeNode[])) {
                const label = await TranslationService.translate(node.label);
                const tooltip = await TranslationService.translate(node.tooltip);
                node.label = label;
                node.tooltip = tooltip;
            }
            nodes = [...additionalNodes.value, ...nodes];
        }

        return nodes;
    }

    private async preloadNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const preloadPatternOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN
        );

        if (preloadPatternOption && preloadPatternOption.value) {
            nodes = await this.search(10, preloadPatternOption.value);
        }

        return nodes;
    }

    private createTreeHandler(nodes: TreeNode[]): void {
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            const keepSelectionOption = this.state.field?.options.find(
                (o) => o.option === ObjectReferenceOptions.KEEP_SELECTION
            );

            const keepSelection = keepSelectionOption ? keepSelectionOption.value : false;
            const filterSelection = !keepSelection && !this.state.freeText;
            treeHandler.setTree(nodes, null, true, filterSelection);
        }
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formValue = formInstance?.getFormFieldValue<number>(this.state.field?.instanceId);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);

        const valueDefined = typeof formValue.value !== 'undefined' && formValue.value !== null;
        if (treeHandler && formValue && valueDefined) {
            const objectIds: Array<string | number> = Array.isArray(formValue.value)
                ? formValue.value
                : [formValue.value];

            let selectedNodes = [];
            let success = false;
            if (this.autocomplete) {
                const idsToLoad = objectIds.filter((id) => typeof id !== 'string' || !id.match(/<KIX_.+>/));
                if (idsToLoad.length) {
                    const objects = await KIXObjectService.loadObjects(
                        this.objectType, idsToLoad, this.loadingOptions, this.specificLoadingOptions, null, null, true
                    ).catch(() => []);

                    for (const object of objects) {
                        const node = await ObjectReferenceUtil.createTreeNode(
                            object, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId,
                            this.translatable
                        );
                        if (node) {
                            node.selected = true;
                            selectedNodes.push(node);
                        }
                    }
                    success = true;
                }
            } else {
                const objectOption = this.state.field?.options.find(
                    (o) => o.option === ObjectReferenceOptions.OBJECT
                );
                if (objectOption) {
                    success = true;
                    // filter placeholder values
                    const loadIds = objectIds.filter((id) => typeof id !== 'string' || !id.match(/<KIX_.+>/));
                    if (loadIds.length) {
                        const objects = await KIXObjectService.loadObjects(
                            objectOption.value, loadIds, null, null, null, null, true
                        );
                        if (objects && !!objects.length) {
                            const translatableOption = this.state.field?.options.find(
                                (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
                            );
                            const translatable = !translatableOption || Boolean(translatableOption.value);
                            for (const object of objects) {
                                const node = await ObjectReferenceUtil.createTreeNode(
                                    object, translatable, this.isInvalidClickable, this.useTextAsId, this.translatable
                                );
                                if (node) {
                                    node.selected = true;
                                    selectedNodes.push(node);
                                }
                            }
                        }
                    }
                }
            }

            if (this.state.freeText || !success) {
                const freeTextNodes = objectIds
                    .filter((oid) => !selectedNodes.some((sn) => sn.id.toString() === oid.toString()))
                    .map((v) => new TreeNode(v, v?.toString()));
                selectedNodes = [...selectedNodes, ...freeTextNodes];
            }

            treeHandler.selectNone(true);
            setTimeout(() => treeHandler.setSelection(selectedNodes, true, true, true), 200);
        } else if (treeHandler) {
            treeHandler.selectNone();
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNodes = nodes && nodes.length ? nodes : [];
        if (currentNodes.length) {
            if (this.state.multiselect) {
                super.provideValue(currentNodes.map((n) => n.id));
            } else {
                super.provideValue(currentNodes[0].id);
            }
        } else {
            super.provideValue(null);
        }
    }

    private setOptions(): void {
        const objectOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        this.objectType = objectOption?.value;

        const configLoadingOptions = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
        );
        this.loadingOptions = configLoadingOptions?.value;

        const specificLoadingOptions = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.OBJECT_SPECIFIC_LOADINGOPTIONS
        );
        this.specificLoadingOptions = specificLoadingOptions?.value;

        const objectIdOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
        this.objectIds = objectIdOption && Array.isArray(objectIdOption.value) && objectIdOption.value.length
            ? objectIdOption.value
            : null;

        const showValidOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;
        this.showInvalidNodes = showValidOption ? showValidOption.value : true;

        const validClickableOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === FormFieldOptions.INVALID_CLICKABLE)
            : null;
        this.isInvalidClickable = validClickableOption ? validClickableOption.value : false;

        const textAsIdOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.TEXT_AS_ID)
            : null;
        this.useTextAsId = textAsIdOption ? Boolean(textAsIdOption.value) : false;

        const autocompleteOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
        );
        if (typeof autocompleteOption !== 'undefined' && autocompleteOption !== null) {
            if (autocompleteOption.value) {
                this.autocomplete = true;
                this.state.autoCompleteConfiguration = typeof autocompleteOption.value === 'object'
                    ? autocompleteOption.value
                    : new AutoCompleteConfiguration();
            }
        }

        const isMultiselectOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.MULTISELECT
        );
        this.state.multiselect = typeof isMultiselectOption === 'undefined' || isMultiselectOption === null
            ? false
            : isMultiselectOption.value;

        const countMaxOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.COUNT_MAX
        );
        if (countMaxOption?.value === 1) {
            this.state.multiselect = false;
        }

        const freeTextOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.FREETEXT
        );
        this.state.freeText = typeof freeTextOption !== 'undefined' && freeTextOption !== null
            ? freeTextOption.value
            : false;

        const translatableOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        this.translatable = !translatableOption || Boolean(translatableOption.value);
    }
}

module.exports = Component;
