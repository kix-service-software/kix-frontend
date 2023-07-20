/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { DataType } from '../../../../model/DataType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { SortUtil } from '../../../../model/SortUtil';
import { ObjectReferenceUtil } from '../../../base-components/webapp/components/object-reference-input/ObjectReferenceUtil';
import { IKIXObjectService } from '../../../base-components/webapp/core/IKIXObjectService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { TreeHandler, TreeNode, TreeService, TreeUtil } from '../../../base-components/webapp/core/tree';
import { FormValueBinding } from '../FormValueBinding';
import { FormValueProperty } from '../FormValueProperty';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class SelectObjectFormValue<T = Array<string | number>> extends ObjectFormValue<T> {

    public objectType: KIXObjectType | string;
    public autoCompleteConfiguration: AutoCompleteConfiguration;
    public isAutoComplete: boolean = false;
    public searchTimeout: any;
    public loadingOptions: KIXObjectLoadingOptions;
    public specificLoadingOptions: KIXObjectSpecificLoadingOptions;
    public uniqueNodes: boolean = true;
    public objectIds: number[];
    public showInvalidNodes: boolean = false;
    public isInvalidClickable: boolean = false;
    public useTextAsId: boolean = false;
    public multiselect: boolean = false;
    public freeText: boolean = false;
    public translatable: boolean = true;
    public structureOption: boolean = true;
    public fieldOptions: FormFieldOption[];
    public hasFilter: boolean = true;
    public isEmpty: boolean = false;

    public minSelectCount: number;
    public maxSelectCount: number;

    public treeHandler: TreeHandler;
    public searchValue: string;

    protected initialized: boolean = false;
    protected selectedNodes: TreeNode[] = [];

    public constructor(
        public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'select-form-input';

        this.bindings.push(
            new FormValueBinding(this, 'minSelectCount', object, property),
            new FormValueBinding(this, 'maxSelectCount', object, property),
            new FormValueBinding(this, 'selectedNodes', object, property),
            new FormValueBinding(this, 'multiselect', object, property),
        );

        this.addPropertyBinding(FormValueProperty.POSSIBLE_VALUES, (value: SelectObjectFormValue) => {
            if (this.isAutoComplete && this.possibleValues?.length) {
                this.isAutoComplete = false;
                this.loadSelectableValues();
            }
        });
    }

    public destroy(): void {
        TreeService.getInstance().removeTreeHandler(this.instanceId);
        super.destroy();
    }

    public setInitialState(): void {
        super.setInitialState();
        this.initialState.set('autoCompleteConfiguration', this.autoCompleteConfiguration);
        this.initialState.set('isAutoComplete', this.isAutoComplete);
        this.initialState.set('loadingOptions', this.loadingOptions);
        this.initialState.set('specificLoadingOptions', this.specificLoadingOptions);
        this.initialState.set('uniqueNodes', this.uniqueNodes);
        this.initialState.set('objectIds', this.objectIds);
        this.initialState.set('showInvalidNodes', this.showInvalidNodes);
        this.initialState.set('isInvalidClickable', this.isInvalidClickable);
        this.initialState.set('useTextAsId', this.useTextAsId);
        this.initialState.set('multiselect', this.multiselect);
        this.initialState.set('freeText', this.freeText);
        this.initialState.set('translatable', this.translatable);
        this.initialState.set('structureOption', this.structureOption);
        this.initialState.set('fieldOptions', this.fieldOptions);
        this.initialState.set('minSelectCount', this.minSelectCount);
        this.initialState.set('maxSelectCount', this.maxSelectCount);
    }

    public async reset(
        ignoreProperties: string[] = [], ignoreFormValueProperties: string[] = [], ignoreFormValueReset: string[] = []
    ): Promise<void> {
        await super.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
        if (this.enabled) {
            await this.loadSelectableValues();
            await this.loadSelectedValues();
        }
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (force) {
            if (value !== null && !Array.isArray(value)) {
                value = [value];
            }
        } else {
            if (!this.freeText && !this.isAutoComplete) {
                if (Array.isArray(value)) {
                    value = value?.filter((v) => TreeUtil.findNode(this.treeHandler?.getTree(), v.toString()) !== null);
                } else if (value !== null) {
                    const node = TreeUtil.findNode(this.treeHandler?.getTree(), value?.toString());
                    if (!node) {
                        value = [];
                    }
                }
            } else if (this.multiselect) {
                value = this.removeEmptyValues(value);
            }
        }

        await super.setFormValue(value, force);

        if (!this.readonly || force) {
            await this.loadSelectedValues();
        }
    }

    public removeEmptyValues(value: any): Array<any> {
        if (Array.isArray(value) && value?.length > 0) {
            const newValue = [];
            for (let val of value) {
                if (typeof val === 'string') {
                    val = val.trim();
                }

                const isWildCardValue = typeof val === 'string' && val?.includes('*');
                if (val && !isWildCardValue) {
                    newValue.push(val);
                }
            }
            return newValue;
        } else if (value === '') {
            return [];
        }
    }

    public async setObjectValue(value: any): Promise<void> {
        if (!this.multiselect && Array.isArray(value) && value.length) {
            value = value[0];
        }

        await super.setObjectValue(value);
    }

    public async initFormValue(): Promise<void> {
        this.multiselect = this.maxSelectCount < 0 || this.maxSelectCount > 1;
        this.setNewInitialState('multiselect', this.multiselect);

        if (this.minSelectCount > 0) {
            this.required = true;
        }

        await super.initFormValue();

        if (!this.treeHandler) {
            await this.initTreeHandler();
        }
        this.treeHandler?.setMultiSelect(this.multiselect);

        await this.loadSelectableValues();
        await this.loadSelectedValues();

        this.addPropertyBinding('multiselect', (value: SelectObjectFormValue) => {
            if (!this.multiselect && Array.isArray(this.value) && this.value.length > 1) {
                this.setFormValue([this.value[0]], true);
            }
        });

        this.addPropertyBinding('maxSelectCount', (value: SelectObjectFormValue) => {
            this.multiselect = this.maxSelectCount < 0 || this.maxSelectCount > 1;
            this.treeHandler?.setMultiSelect(this.multiselect);

            if (this.multiselect && Array.isArray(this.value) && this.value.length > 1) {
                const hasMoreValues = this.maxSelectCount > 1 && this.value.length > this.maxSelectCount;
                if (hasMoreValues) {
                    const newValue = this.value.slice(0, this.maxSelectCount);
                    this.setFormValue(newValue, true);
                }
            }
        });

        this.addPropertyBinding(FormValueProperty.ENABLED, (value: SelectObjectFormValue) => {
            this.loadSelectableValues();
        });

        this.initialized = true;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {

        // handle select count here, too (but not exclusive),
        // to init mulitselect correctly (for preset values by placeholders)
        this.multiselect = this.maxSelectCount < 0 || this.maxSelectCount > 1;

        if (field) {
            // map deprecated input components
            switch (this.inputComponentId) {
                case 'object-reference-input':
                    this.inputComponentId = 'select-form-input';
                    break;
                default:
            }

            this.fieldOptions = field?.options?.length ? field.options : this.fieldOptions;

            const objectOption = field?.options?.find((o) => o.option === ObjectReferenceOptions.OBJECT);
            this.objectType = objectOption?.value || this.objectType;

            const configLoadingOptions = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
            );
            this.loadingOptions = configLoadingOptions?.value || this.loadingOptions;

            const specificLoadingOptions = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.OBJECT_SPECIFIC_LOADINGOPTIONS
            );
            this.specificLoadingOptions = specificLoadingOptions?.value || this.specificLoadingOptions;

            const objectIdOption = field?.options?.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
            this.objectIds = objectIdOption && Array.isArray(objectIdOption.value) && objectIdOption.value.length
                ? objectIdOption.value
                : null;

            if (field?.countMax && field?.countMax > 1) {
                const uniqueOption = field?.options?.find((o) => o.option === ObjectReferenceOptions.UNIQUE);
                this.uniqueNodes = uniqueOption ? uniqueOption.value : this.uniqueNodes;
            }

            const showValidOption = field?.options?.find((o) => o.option === FormFieldOptions.SHOW_INVALID);
            this.showInvalidNodes = showValidOption ? showValidOption.value : this.showInvalidNodes;

            const validClickableOption = field?.options?.find(
                (o) => o.option === FormFieldOptions.INVALID_CLICKABLE
            );
            this.isInvalidClickable = validClickableOption?.value || this.isInvalidClickable;

            const textAsIdOption = field?.options?.find((o) => o.option === ObjectReferenceOptions.TEXT_AS_ID);
            this.useTextAsId = textAsIdOption ? Boolean(textAsIdOption.value) : this.useTextAsId;

            const autocompleteOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
            );
            if (typeof autocompleteOption !== 'undefined' && autocompleteOption !== null) {
                if (autocompleteOption.value) {
                    this.isAutoComplete = true;
                    this.autoCompleteConfiguration = typeof autocompleteOption.value === 'object'
                        ? autocompleteOption.value
                        : new AutoCompleteConfiguration();
                }
            }

            const isMultiselectOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.MULTISELECT
            );
            this.multiselect = typeof isMultiselectOption === 'undefined' || isMultiselectOption === null
                ? this.multiselect
                : isMultiselectOption.value;

            const countMaxOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.COUNT_MAX
            );

            this.maxSelectCount = countMaxOption?.value || this.maxSelectCount;

            if (countMaxOption?.value === 1) {
                this.multiselect = false;
            }

            this.setNewInitialState('multiselect', this.multiselect);

            const countMinOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.COUNT_MIN
            );
            this.minSelectCount = countMinOption?.value || this.minSelectCount;

            const freeTextOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.FREETEXT
            );
            this.freeText = typeof freeTextOption !== 'undefined' && freeTextOption !== null
                ? freeTextOption.value
                : false;

            const translatableOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
            );
            this.translatable = !translatableOption || Boolean(translatableOption.value);

            const structureOption = field?.options?.find(
                (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
            );
            this.structureOption = !structureOption || Boolean(structureOption?.value);

            this.isEmpty = field?.empty || false;
        }

        // INFO: do not init treehandler here bacause it will set selected nodes and
        // for some DFs type not all relevant info is already given (e.g. possibleValues)

        await super.initFormValueByField(field);
    }

    protected async initTreeHandler(): Promise<void> {
        this.treeHandler = new TreeHandler([], null, null, this.multiselect);
        TreeService.getInstance().registerTreeHandler(this.instanceId, this.treeHandler);

        this.treeHandler?.registerSelectionListener(this.instanceId + '-selection', (nodes: TreeNode[]) => {
            if (this.initialized) {
                this.setSelectedNodes(nodes);
            }
        });

        await this.loadSelectableValues();
    }

    protected async setSelectedNodes(nodes: TreeNode[] = []): Promise<void> {
        const tree = this.treeHandler?.getTree();

        const selectedNodes = this.treeHandler?.getSelection(this.treeHandler?.getTree()) || [];
        const selectedIds = selectedNodes.map((n: TreeNode) => n.id);

        const newValue = [];

        const value = this.value !== undefined && this.value !== null
            ? Array.isArray(this.value) ? this.value : [this.value]
            : null;

        if (Array.isArray(value)) {
            for (const v of value) {
                if (typeof v !== 'undefined' && v !== null) {
                    if (TreeUtil.findNode(tree, v)) {
                        if (selectedIds.some((id) => id.toString() === v.toString())) {
                            newValue.push(v);
                        }
                    } else if (this.multiselect) {
                        newValue.push(v);
                    }
                }
            }
        }

        for (const node of nodes) {
            if (!newValue.some((v) => v.toString() === node?.id?.toString())) {
                newValue.push(node.id);
            }
        }

        return this.setFormValue(newValue.length ? newValue as any : null);
    }

    public async loadSelectableValues(): Promise<void> {
        let objects = [];
        if (this.enabled) {
            if (this.isAutoComplete) {
                objects = await this.searchObjects();
            } else if (this.possibleValues) {
                objects = await KIXObjectService.loadObjects(this.objectType, this.possibleValues, this.loadingOptions);
            } else {
                objects = await KIXObjectService.loadObjects(this.objectType, null, this.loadingOptions);
            }

            if (Array.isArray(this.additionalValues)) {
                const additionalObjects = await KIXObjectService.loadObjects(
                    this.objectType, this.additionalValues, this.loadingOptions
                ).catch(() => []);

                objects.push(...additionalObjects);
            }

            if (Array.isArray(this.forbiddenValues)) {
                objects = objects.filter(
                    (o) => !this.forbiddenValues?.some((fv) => fv.toString() === o.ObjectId.toString())
                );
            }

            await this.prepareSelectableNodes(objects);
        }
    }

    protected async prepareSelectableNodes(objects: KIXObject[]): Promise<void> {
        let nodes: TreeNode[] = [];
        if (Array.isArray(objects) && objects.length) {
            if (this.structureOption) {
                nodes = await KIXObjectService.prepareObjectTree(
                    this.objectType, objects, this.showInvalidNodes,
                    this.isInvalidClickable, null, this.translatable
                );
            } else {
                const promises = [];
                for (const o of objects) {
                    promises.push(ObjectReferenceUtil.createTreeNode(
                        o, this.showInvalidNodes, this.isInvalidClickable, this.useTextAsId, this.translatable
                    ));
                }

                nodes = await Promise.all<TreeNode>(promises);
                nodes.filter((n) => n instanceof TreeNode);
            }

            nodes = nodes.filter((node, index) => nodes.findIndex((n) => n.id === node.id) === index);
            SortUtil.sortObjects(nodes, 'label', DataType.STRING);
        }

        const value = this.value !== undefined && this.value !== null
            ? Array.isArray(this.value) ? this.value : [this.value]
            : null;

        if (Array.isArray(value)) {
            for (const v of value) {
                const node = TreeUtil.findNode(nodes, v);
                if (node) {
                    node.selected = true;
                }
            }
        }

        this.treeHandler?.setTree(nodes, undefined, true, true);
    }

    public async search(searchValue: string): Promise<void> {
        this.searchValue = searchValue;
        if (this.searchValue) {
            if (this.isAutoComplete && this.autoCompleteConfiguration) {
                await this.loadSelectableValues();
            } else {
                this.treeHandler?.filter(this.searchValue);
            }
        } else {
            this.treeHandler?.filter(null);
        }
    }

    protected async searchObjects(): Promise<T[]> {
        let objects = [];
        if (this.searchValue?.length >= this.autoCompleteConfiguration.charCount) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(this.objectType);
            const filter = service && this.searchValue
                ? await service.prepareFullTextFilter(this.searchValue)
                : [];

            let loadingOptions = new KIXObjectLoadingOptions();

            loadingOptions.filter = Array.isArray(this.loadingOptions?.filter) ? [...this.loadingOptions.filter] : [];
            loadingOptions.filter.push(...filter);

            loadingOptions.limit = this.autoCompleteConfiguration?.limit;
            loadingOptions.searchLimit = this.autoCompleteConfiguration?.limit;

            loadingOptions.includes = this.loadingOptions?.includes;
            loadingOptions.expands = this.loadingOptions?.expands;
            loadingOptions.query = this.loadingOptions?.query;
            loadingOptions.sortOrder = this.loadingOptions?.sortOrder;

            loadingOptions = await ObjectReferenceUtil.prepareLoadingOptions(loadingOptions, this.searchValue);

            if (service) {
                objects = await service.loadObjects<KIXObject>(
                    this.objectType, null, loadingOptions, this.specificLoadingOptions, false
                ).catch(() => []);
            }
        }

        return objects;
    }

    public getSelectableTreeNodeValues(): TreeNode[] {
        return this.treeHandler?.getTree() || [];
    }

    public async getSelectedTreeNodes(reload?: boolean): Promise<TreeNode[]> {
        if (reload) {
            await this.loadSelectedValues();
        }
        return this.selectedNodes || [];
    }

    public async loadSelectedValues(): Promise<void> {
        const valueDefined = typeof this.value !== 'undefined' && this.value !== null;
        let selectedNodes: TreeNode[] = [];

        if (valueDefined && this.treeHandler) {
            let objectIds: Array<T> = Array.isArray(this.value)
                ? this.value
                : this.value ? [this.value] : [];
            objectIds = objectIds.filter((id) => id !== null && typeof id !== 'undefined');

            if (Array.isArray(this.possibleValues)) {
                const allowedValues = this.possibleValues;

                if (this.additionalValues?.length) {
                    allowedValues.push(...this.additionalValues);
                }

                objectIds = objectIds.filter(
                    (id) => allowedValues.some((pv) => pv.toString() === id.toString())
                );
            }

            // ignore text values if ids are no texts themself (handle them like freetext), ignore placeholders
            // and collect ids only if objectType is given (relevant if "additional node" is selected/current value)
            const idsToLoad = this.objectType
                ? !this.useTextAsId ? objectIds.filter((id) => !isNaN(Number(id)))
                    : objectIds.filter((id) => !id.toString().match(/<KIX_.+>/))
                : [];
            if (idsToLoad.length) {
                if (this.isAutoComplete) {
                    const objects = await KIXObjectService.loadObjects(
                        this.objectType, idsToLoad as any[], this.loadingOptions,
                        this.specificLoadingOptions, true, null, true
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
                } else {
                    const objects = await KIXObjectService.loadObjects(
                        this.objectType, idsToLoad as any[], null, null, true, null, true
                    ).catch(() => []);
                    if (objects && !!objects.length) {
                        for (const object of objects) {
                            const node = await ObjectReferenceUtil.createTreeNode(
                                object, this.translatable, this.isInvalidClickable, this.useTextAsId, this.translatable
                            );
                            if (node) {
                                node.selected = true;
                                selectedNodes.push(node);
                            }
                        }
                    }
                }
            }

            if (this.freeText || idsToLoad.length !== objectIds.length) {
                const freeTextNodes = objectIds
                    .filter((oid) => !selectedNodes.some((sn) => sn.id.toString() === oid.toString()))
                    .map((v) => new TreeNode(v, v?.toString()));
                selectedNodes = [...selectedNodes, ...freeTextNodes];
            }

            selectedNodes = selectedNodes.filter(
                (node, index) => selectedNodes.findIndex((n) => n.id === node.id) === index
            );
            this.treeHandler?.setSelection(selectedNodes, true, true, undefined, true);
        } else {
            this.treeHandler?.selectNone(true);
        }

        this.selectedNodes = selectedNodes.sort((a, b) => a.id - b.id);
    }

    public async removeValue(value: string | number): Promise<void> {
        if (value && this.multiselect && Array.isArray(this.value)) {
            const index = this.value.findIndex((v: string | number) => v.toString() === value.toString());
            if (index !== -1) {
                // set current value to trigger binding
                const newValue = [...this.value];
                newValue.splice(index, 1);
                await this.setFormValue(newValue);
            }

            // remove node from treeHandler
            const selectedNodes = this.treeHandler.getSelectedNodes();
            const selectNode = selectedNodes?.find((n) => n.id === value);
            if (selectNode) {
                this.treeHandler?.setSelection([selectNode], false, true, true, true);
            }

        } else {
            await this.setFormValue(null);
            this.treeHandler?.selectNone();
        }
    }

    public selectAll(): void {
        this.treeHandler?.selectAll();
    }

    public async update(): Promise<void> {
        await this.loadSelectableValues();
        await this.setSelectedNodes();
    }
}
