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
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { UIUtil } from '../../core/UIUtil';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { ContextService } from '../../core/ContextService';
import { PlaceholderService } from '../../core/PlaceholderService';

class Component extends FormInputComponent<string | number | string[] | number[], ComponentState> {

    private objects: KIXObject[];
    private autocomplete: boolean = false;
    private formSubscriber: IEventSubscriber;

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
            eventPublished: (data: any, eventId: string) => {
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
        const objectOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const configLoadingOptions = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
        );

        const objectIdOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
        const objectIds = objectIdOption && Array.isArray(objectIdOption.value) && objectIdOption.value.length
            ? objectIdOption.value
            : null;

        const loadingOptions = configLoadingOptions ? configLoadingOptions.value : null;

        this.objects = await KIXObjectService.loadObjects(
            objectOption.value, objectIds, loadingOptions
        );
        const structureOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
        );

        const showInvalid = this.isShowInvalidNodes();
        const invalidClickable = this.isInvalidClickable();

        const objectId = await UIUtil.getEditObjectId(objectOption.value);

        const translatableOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        const translatable = !translatableOption || Boolean(translatableOption.value);

        if (structureOption && structureOption.value) {
            nodes = await KIXObjectService.prepareObjectTree(
                this.objects, showInvalid, invalidClickable, objectId ? [objectId] : null, translatable
            );
        } else {
            for (const o of this.objects) {
                const node = await this.createTreeNode(o, translatable, objectId ? [objectId] : undefined);
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

    private isShowInvalidNodes(): boolean {
        const showValidOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;
        return showValidOption ? showValidOption.value : true;
    }

    private isInvalidClickable(): boolean {
        const validClickableOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === FormFieldOptions.INVALID_CLICKABLE)
            : null;
        return validClickableOption ? validClickableOption.value : false;
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formValue = formInstance?.getFormFieldValue<number>(this.state.field?.instanceId);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);

        if (treeHandler && formValue && typeof formValue.value !== 'undefined' && formValue.value !== null) {
            const objectIds: any[] = Array.isArray(formValue.value)
                ? formValue.value : [formValue.value];

            let selectedNodes = [];

            if (!this.autocomplete) {
                const nodes = treeHandler.getTree();
                if (nodes && nodes.length) {
                    objectIds.forEach((oid) => {
                        const node = TreeUtil.findNode(nodes, oid);
                        if (node) {
                            node.selected = true;
                            selectedNodes.push(node);
                        }
                    });
                }
            } else {
                const objectOption = this.state.field?.options.find(
                    (o) => o.option === ObjectReferenceOptions.OBJECT
                );
                if (objectOption) {
                    const objects = await KIXObjectService.loadObjects(
                        objectOption.value, objectIds, null, null, null, null, true
                    );
                    if (objects && !!objects.length) {
                        const translatableOption = this.state.field?.options.find(
                            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
                        );
                        const translatable = !translatableOption || Boolean(translatableOption.value);
                        for (const object of objects) {
                            const node = await this.createTreeNode(object, translatable);
                            if (node) {
                                node.selected = true;
                                selectedNodes.push(node);
                            }
                        }
                    }
                }
            }

            const freeTextOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.FREETEXT);

            if (freeTextOption && freeTextOption.value) {
                const freeTextNodes = objectIds
                    .filter((oid) => !selectedNodes.some((sn) => sn.id.toString() === oid.toString()))
                    .map((v) => new TreeNode(v, v));
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
        const autocompleteOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
        );

        if (typeof autocompleteOption !== 'undefined' && autocompleteOption !== null) {
            if (autocompleteOption.value) {
                this.autocomplete = true;
                this.state.autoCompleteConfiguration = new AutoCompleteConfiguration();
            }
        }

        const isMultiselectOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.MULTISELECT
        );
        this.state.multiselect = typeof isMultiselectOption === 'undefined'
            || isMultiselectOption === null ? false : isMultiselectOption.value;

        const freeTextOption = this.state.field?.options.find(
            (o) => o.option === ObjectReferenceOptions.FREETEXT
        );
        if (typeof freeTextOption !== 'undefined' && freeTextOption !== null) {
            this.state.freeText = freeTextOption.value;
        }
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        let nodes = [];
        const objectOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const objectIdOption = this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
        const objectIds = objectIdOption && Array.isArray(objectIdOption.value) && objectIdOption.value.length
            ? objectIdOption.value
            : null;

        if (objectOption) {
            if (this.autocomplete) {
                const objectType = objectOption.value as KIXObjectType;

                const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
                let filter: FilterCriteria[];
                if (service && searchValue) {
                    filter = await service.prepareFullTextFilter(searchValue);
                }
                const fieldLoadingOptions = this.state.field?.options.find(
                    (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
                );
                const loadingOptions: KIXObjectLoadingOptions = fieldLoadingOptions
                    ? { ...fieldLoadingOptions.value }
                    : new KIXObjectLoadingOptions();

                if (loadingOptions.filter) {
                    loadingOptions.filter = [...loadingOptions.filter];
                    loadingOptions.filter = [
                        ...loadingOptions.filter.map((f) => {
                            if (f.value === SearchProperty.SEARCH_VALUE) {
                                if (f.operator === SearchOperator.LIKE) {
                                    searchValue = `*${searchValue}*`;
                                }
                                return new FilterCriteria(f.property, f.operator, f.type, f.filterType, searchValue);
                            } else {
                                return f;
                            }
                        }),
                    ];
                    if (filter) {
                        loadingOptions.filter.push(...filter);
                    }
                } else {
                    loadingOptions.filter = filter;
                }
                loadingOptions.limit = limit;

                const preparedOptions = await this.prepareLoadingOptions(loadingOptions);
                this.objects = await KIXObjectService.loadObjects<KIXObject>(
                    objectType, objectIds, preparedOptions, null, false
                );

                if (searchValue && searchValue !== '') {
                    const structureOption = this.state.field?.options.find(
                        (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
                    );
                    const translatableOption = this.state.field?.options.find(
                        (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
                    );
                    const translatable = !translatableOption || Boolean(translatableOption.value);
                    const objectId = await UIUtil.getEditObjectId(objectOption.value);
                    if (structureOption && structureOption.value) {
                        const showInvalid = this.isShowInvalidNodes();
                        const invalidClickable = this.isInvalidClickable();
                        nodes = await KIXObjectService.prepareObjectTree(
                            this.objects, showInvalid, invalidClickable, objectId ? [objectId] : null, translatable
                        );
                    } else {
                        for (const o of this.objects) {
                            const node = await this.createTreeNode(o, translatable, objectId ? [objectId] : undefined);
                            if (node) {
                                nodes.push(node);
                            }
                        }
                    }
                    nodes = SortUtil.sortObjects(nodes, 'label', DataType.STRING);
                }
            }
        }

        return nodes;
    }

    private async createTreeNode(o: KIXObject, translatable?: boolean, filterIds: any[] = []): Promise<TreeNode> {
        if (typeof o === 'string') {
            return new TreeNode(o, o);
        } else {
            const showInvalid = this.isShowInvalidNodes();
            // typeof o.ValidID === 'undefined' - needed for objects without ValidID like ValidObject
            if (
                (typeof o.ValidID === 'undefined' || o.ValidID === 1 || showInvalid)
                && !filterIds.some((id) => id === o.ObjectId)
            ) {
                const invalidClickable = this.isInvalidClickable();
                const text = await LabelService.getInstance().getObjectText(o, undefined, undefined, translatable);
                const icon = LabelService.getInstance().getObjectIcon(o);
                let tooltip = await LabelService.getInstance().getTooltip(o, translatable);
                let textAsId;
                if (this.useTextAsId()) {
                    textAsId = await LabelService.getInstance().getObjectText(o, undefined, undefined, false);
                }

                tooltip = (tooltip && tooltip !== text) ? text + ': ' + tooltip : text;
                return new TreeNode(
                    textAsId || o.ObjectId,
                    text ? text : o.ObjectId?.toString(),
                    icon,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    typeof o.ValidID === 'undefined' || o.ValidID === 1 || invalidClickable,
                    tooltip, undefined, undefined, undefined,
                    typeof o.ValidID !== 'undefined' && o.ValidID !== 1
                );
            } else {
                return;
            }
        }
    }

    private useTextAsId(): boolean {
        const textAsIdOption = this.state.field?.options
            ? this.state.field?.options.find((o) => o.option === ObjectReferenceOptions.TEXT_AS_ID)
            : null;
        return textAsIdOption ? Boolean(textAsIdOption.value) : false;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    protected async prepareLoadingOptions(loadingOptions: KIXObjectLoadingOptions): Promise<KIXObjectLoadingOptions> {
        const preparedLoadingOptions = new KIXObjectLoadingOptions(
            [],
            loadingOptions.sortOrder,
            loadingOptions.limit,
            loadingOptions.includes,
            loadingOptions.expands,
            loadingOptions.query
        );

        if (Array.isArray(loadingOptions.filter)) {
            const context = ContextService.getInstance().getActiveContext();
            const contextObject = await context.getObject();
            for (const criterion of loadingOptions.filter) {
                if (typeof criterion.value === 'string') {
                    const value = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.value, contextObject
                    );
                    const preparedCriterion = new FilterCriteria(
                        criterion.property, criterion.operator, criterion.type, criterion.filterType, value
                    );
                    preparedLoadingOptions.filter.push(preparedCriterion);
                } else {
                    preparedLoadingOptions.filter.push(criterion);
                }
            }
        }
        return preparedLoadingOptions;
    }
}

module.exports = Component;
