/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { Context } from '../../../../../model/Context';
import { DataType } from '../../../../../model/DataType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';
import { SortUtil } from '../../../../../model/SortUtil';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { DynamicFormFieldOption } from '../../../../dynamic-fields/webapp/core';
import { ContextService } from '../../core/ContextService';
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';
import { FormValuesChangedEventData } from '../../core/FormValuesChangedEventData';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { TreeHandler, TreeNode, TreeService } from '../../core/tree';
import { UIUtil } from '../../core/UIUtil';
import { ComponentState } from './ComponentState';
import { ObjectReferenceUtil } from './ObjectReferenceUtil';

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

    // TODO: move to FormInstance/ValueHandler as universal solution for unique handling (possible values)
    private uniqueNodes: boolean;

    private context: Context;

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
        this.setOptions();
        (this as any).setStateDirty('field');
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.setOptions();
        const treeHandler = new TreeHandler([], null, null, this.state.multiselect);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();
        this.state.searchCallback = this.search.bind(this);

        this.formSubscriber = {
            eventSubscriberId: this.state.field?.instanceId,
            eventPublished: async (data: any, eventId: string): Promise<void> => {
                if (data.formField && data.formField.instanceId === this.state.field?.instanceId) {
                    this.state.prepared = false;
                    if (eventId === FormEvent.RELOAD_INPUT_VALUES) {
                        // reload options - they could have changed
                        this.setOptions();
                        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
                        if (treeHandler) {
                            treeHandler.setMultiSelect(this.state.multiselect);
                        }
                    }
                    await this.load(false);
                    this.state.prepared = true;
                }
                else if (
                    this.uniqueNodes && eventId === FormEvent.VALUES_CHANGED &&
                    data && (data as FormValuesChangedEventData).changedValues?.length
                ) {
                    // update nodes (e.q. uniques) if different field instance of same property is changed
                    const samePropertyFieldChanged = (data as FormValuesChangedEventData).changedValues.some(
                        (cV) => cV[0]?.property === this.state.field?.property
                            && cV[0]?.instanceId !== this.state.field?.instanceId
                    );
                    if (samePropertyFieldChanged) {
                        this.load(false);
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.RELOAD_INPUT_VALUES, this.formSubscriber);
        if (this.uniqueNodes) {
            EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
        EventService.getInstance().unsubscribe(FormEvent.RELOAD_INPUT_VALUES, this.formSubscriber);
        if (this.uniqueNodes) {
            EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }
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

        if (this.autocomplete) {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            nodes = treeHandler?.getSelectedNodes() || [];
        }
        else {
            nodes = await this.loadNodes().catch(() => []);
        }

        const additionalNodes = await this.loadAdditionalNodes().catch(() => []);
        nodes = [...nodes, ...additionalNodes];

        if (preload) {
            const preloadedNodes = await this.preloadNodes().catch(() => []);
            nodes = [...preloadedNodes, ...nodes];
        }

        if (this.uniqueNodes) {
            nodes = await this.handleUnique(nodes);
        }

        this.fillTreeHandler(nodes);
    }

    private async loadNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        this.objects = await KIXObjectService.loadObjects(
            this.objectType, this.objectIds, this.loadingOptions, null, true
        ).catch(() => []);
        const structureOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
        );

        const objectId = await UIUtil.getEditObjectId(this.objectType);

        const translatableOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        const translatable = !translatableOption || Boolean(translatableOption.value);

        if (structureOption && structureOption.value) {
            nodes = await KIXObjectService.prepareObjectTree(
                this.objectType, this.objects, this.showInvalidNodes,
                this.isInvalidClickable, objectId ? [objectId] : null, translatable, this.useTextAsId
            );
        }
        else {
            const promises = [];
            for (const o of this.objects) {
                promises.push(ObjectReferenceUtil.createTreeNode(
                    o, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId,
                    translatable, objectId ? [objectId] : undefined
                ));
            }

            nodes = await Promise.all<TreeNode>(promises);
            nodes.filter((n) => n instanceof TreeNode);
        }

        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    private async loadAdditionalNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const additionalNodes = this.state.field?.options?.find(
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
        const preloadPatternOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN
        );

        if (preloadPatternOption && preloadPatternOption.value) {
            nodes = await this.search(10, preloadPatternOption.value);
        }

        return nodes;
    }

    // TODO: move to FormInstance/ValueHandler as universal solution for unique handling (possible values)
    private async handleUnique(nodes: TreeNode[]): Promise<TreeNode[]> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const fieldList = await formInstance.getFields(this.state.field);
            let usedValues = [];
            fieldList.forEach((f) => {
                if (f.property === this.state.field?.property && f.instanceId !== this.state.field?.instanceId) {
                    const fieldValue = formInstance.getFormFieldValue(f.instanceId);
                    if (fieldValue && fieldValue.value !== null) {
                        if (Array.isArray(fieldValue.value)) {
                            usedValues = [...usedValues, ...fieldValue.value];
                        }
                        else {
                            usedValues.push(fieldValue.value);
                        }
                    }
                }
            });
            nodes = nodes.filter((n) => !usedValues.some((v) => v === n.id));
        }
        return nodes;
    }

    private fillTreeHandler(nodes: TreeNode[]): void {
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            const keepSelectionOption = this.state.field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.KEEP_SELECTION
            );

            const keepSelection = keepSelectionOption ? keepSelectionOption.value : false;
            const filterSelection = !keepSelection && !this.state.freeText;
            treeHandler.setTree(nodes, null, keepSelection, filterSelection);
        }
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();
        const formValue = formInstance?.getFormFieldValue<number>(this.state.field?.instanceId);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);

        const valueDefined = typeof formValue?.value !== 'undefined' && formValue?.value !== null;

        if (treeHandler && valueDefined) {
            const objectIds: Array<string | number> = Array.isArray(formValue.value)
                ? formValue.value
                : formValue.value ? [formValue.value] : [];

            let selectedNodes = [];

            // ignore placeholder and "useTextAsId" values (handle them like freetext)
            // and collect ids only if objectType is given (relevant if "additional node" is selected/current value)
            const ids = objectIds.filter((id) =>
                typeof id !== 'string' || (!id.match(/<KIX_.+>/) && !id.match(/\$\{.+\}/))
            );
            const idsToLoad = !this.useTextAsId && this.objectType ? ids : [];
            if (idsToLoad.length) {
                if (this.autocomplete) {
                    const objects = await KIXObjectService.loadObjects(
                        this.objectType, idsToLoad, this.loadingOptions, this.specificLoadingOptions, true, null, true
                    ).catch(() => []);

                    for (const object of objects) {
                        const node = await ObjectReferenceUtil.createTreeNode(
                            object, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId,
                            this.translatable
                        );
                        if (node) {
                            selectedNodes.push(node);
                        }
                    }
                }
                else {
                    const objects = await KIXObjectService.loadObjects(
                        this.objectType, idsToLoad, null, null, true, null, true
                    );
                    if (objects && !!objects.length) {
                        const translatableOption = this.state.field?.options?.find(
                            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
                        );
                        const translatable = !translatableOption || Boolean(translatableOption.value);
                        for (const object of objects) {
                            const node = await ObjectReferenceUtil.createTreeNode(
                                object, translatable, this.isInvalidClickable, this.useTextAsId, this.translatable
                            );
                            if (node) {
                                selectedNodes.push(node);
                            }
                        }
                    }
                }
            }

            if (this.state.freeText || idsToLoad.length !== objectIds.length) {
                const freeTextNodes = objectIds
                    .filter((oid) => !selectedNodes.some((sn) => sn.id.toString() === oid.toString()))
                    .map((v) => new TreeNode(v, v?.toString()));
                selectedNodes = [...selectedNodes, ...freeTextNodes];
            }

            treeHandler.selectNone(true);
            setTimeout(() => {
                treeHandler.setSelection(selectedNodes, true, true, true);
                treeHandler.expandSelection();
            }, 200);
        }
        else if (treeHandler) {
            treeHandler.selectNone();
        }

        this.setPossibleValue();
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNodes = nodes && nodes.length ? nodes : [];
        if (currentNodes.length) {
            if (this.state.multiselect) {
                super.provideValue(currentNodes.map((n) => n.id));
            }
            else {
                super.provideValue(currentNodes[0].id);
            }
        }
        else {
            super.provideValue(null);
        }
    }

    private setOptions(): void {
        const objectOption = this.state.field?.options?.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        this.objectType = objectOption?.value;

        const configLoadingOptions = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
        );
        this.loadingOptions = configLoadingOptions?.value;

        const specificLoadingOptions = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.OBJECT_SPECIFIC_LOADINGOPTIONS
        );
        this.specificLoadingOptions = specificLoadingOptions?.value;

        const objectIdOption = this.state.field?.options?.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
        this.objectIds = objectIdOption?.value;

        if (this.state.field?.countMax && this.state.field?.countMax > 1) {
            const uniqueOption = this.state.field?.options?.find((o) => o.option === ObjectReferenceOptions.UNIQUE);
            this.uniqueNodes = uniqueOption ? uniqueOption.value : true;
        }

        const showValidOption = this.state.field?.options?.find((o) => o.option === FormFieldOptions.SHOW_INVALID);
        this.showInvalidNodes = showValidOption ? showValidOption.value : true;

        const validClickableOption = this.state.field?.options?.find(
            (o) => o.option === FormFieldOptions.INVALID_CLICKABLE
        );
        this.isInvalidClickable = validClickableOption?.value || false;

        const textAsIdOption = this.state.field?.options?.find((o) => o.option === ObjectReferenceOptions.TEXT_AS_ID);
        this.useTextAsId = textAsIdOption ? Boolean(textAsIdOption.value) : false;

        const autocompleteOption = this.state.field?.options?.find(
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
        else {
            this.autocomplete = false;
            this.state.autoCompleteConfiguration = null;
        }

        const isMultiselectOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.MULTISELECT
        );
        this.state.multiselect = typeof isMultiselectOption === 'undefined' || isMultiselectOption === null
            ? false
            : isMultiselectOption.value;

        const countMaxOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.COUNT_MAX
        );
        if (countMaxOption?.value === 1) {
            this.state.multiselect = false;
        }

        const freeTextOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.FREETEXT
        );
        this.state.freeText = typeof freeTextOption !== 'undefined' && freeTextOption !== null
            ? freeTextOption.value
            : false;

        const translatableOption = this.state.field?.options?.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        this.translatable = !translatableOption || Boolean(translatableOption.value);
    }

    public async setPossibleValue(): Promise<void> {
        const formInstance = await this.context?.getFormManager()?.getFormInstance();

        const dfName = this.state.field?.options?.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME)?.value;
        const property = this.state.field?.property === KIXObjectProperty.DYNAMIC_FIELDS
            ? `${ KIXObjectProperty.DYNAMIC_FIELDS }.${ dfName }`
            : this.state.field?.property;

        const possibleValue = formInstance.getPossibleValue(property);
        if (possibleValue && possibleValue.value) {
            const values = Array.isArray(possibleValue.value) ? possibleValue.value : [possibleValue.value];
            this.objectIds = values;
            this.state.possibleValuesOnly = true;
            const nodes = await this.loadNodes();
            this.fillTreeHandler(nodes);
        }
        else {
            this.state.possibleValuesOnly = false;
        }
    }
}

module.exports = Component;
