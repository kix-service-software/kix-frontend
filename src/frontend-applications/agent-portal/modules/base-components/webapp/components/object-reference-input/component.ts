/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TreeNode, TreeService } from '../../core/tree';
import { ObjectReferenceOptions } from '../../../../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { SortUtil } from '../../../../../model/SortUtil';
import { DataType } from '../../../../../model/DataType';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
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
import { IdService } from '../../../../../model/IdService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';

class Component extends FormInputComponent<string | number | string[] | number[], ComponentState> {

    private objects: KIXObject[];
    private autocomplete: boolean = false;
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('object-ref-input');
        this.state.loadNodes = this.load.bind(this);
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
        this.setOptions();
        FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            updateForm: () => { return; },
            formValueChanged: (formField: FormFieldConfiguration, value: FormFieldValue<any>, oldValue: any) => {
                if (formField.instanceId === this.state.field.instanceId) {
                    this.setCurrentNode(null, value, false);
                }
            }
        });
        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        if (this.formListenerId) {
            FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
        }
    }

    private async load(): Promise<TreeNode[]> {
        let nodes = [];
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const loadingOptions = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
        );
        if (objectOption) {
            if (!this.autocomplete) {
                this.objects = await KIXObjectService.loadObjects(
                    objectOption.value, null, loadingOptions ? loadingOptions.value : null
                );
                const structureOption = this.state.field.options.find(
                    (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
                );

                const showInvalid = this.showInvalidNodes();
                const invalidClickable = this.areInvalidClickable();

                const objectId = await UIUtil.getEditObjectId(objectOption.value);

                if (structureOption && structureOption.value) {
                    nodes = await KIXObjectService.prepareObjectTree(
                        this.objects, showInvalid, invalidClickable, objectId ? [objectId] : null
                    );
                } else {
                    for (const o of this.objects) {
                        const node = await this.createTreeNode(o);
                        if (node) {
                            nodes.push(node);
                        }
                    }
                }
                SortUtil.sortObjects(nodes, 'label', DataType.STRING);
            }
        }

        const additionalNodes = this.state.field.options.find(
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

        await this.setCurrentNode(nodes);
        return nodes;
    }

    private showInvalidNodes(): boolean {
        const showValidOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID)
            : null;
        return showValidOption ? showValidOption.value : true;
    }

    private areInvalidClickable(): boolean {
        const validClickableOption = this.state.field.options
            ? this.state.field.options.find((o) => o.option === FormFieldOptions.INVALID_CLICKABLE)
            : null;
        return validClickableOption ? validClickableOption.value : false;
    }

    public async setCurrentNode(nodes?: TreeNode[], value?: any, update: boolean = true): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = value ? value : formInstance.getFormFieldValue<number>(this.state.field.instanceId);
        if (defaultValue && defaultValue.value) {
            const objectIds: any[] = Array.isArray(defaultValue.value)
                ? defaultValue.value : [defaultValue.value];

            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                const selectedNodes = [];

                if (!this.autocomplete) {
                    if (!nodes) {
                        nodes = treeHandler.getTree();
                    }
                    if (nodes && !!nodes.length) {
                        objectIds.forEach((oid) => {
                            const node = this.findNode(oid, nodes);
                            if (node) {
                                node.selected = true;
                                selectedNodes.push(node);
                            }
                        });
                        if (update) {
                            this.nodesChanged(selectedNodes);
                        }
                    }
                } else {
                    const objectOption = this.state.field.options.find(
                        (o) => o.option === ObjectReferenceOptions.OBJECT
                    );
                    if (objectOption) {
                        const objects = await KIXObjectService.loadObjects(
                            objectOption.value, objectIds, null, null, null, null, true
                        );
                        if (objects && !!objects.length) {
                            for (const object of objects) {
                                const node = await this.createTreeNode(object);
                                if (node) {
                                    node.selected = true;
                                    if (nodes) {
                                        nodes.push(node);
                                    }
                                    selectedNodes.push(node);
                                }
                            }
                            if (update) {
                                this.nodesChanged(selectedNodes);
                            }
                        }
                    }
                }
                treeHandler.setSelection(selectedNodes, true, !update, true);
            }
        }
    }

    private findNode(id: any, nodes: TreeNode[]): TreeNode {
        let returnNode: TreeNode;
        if (Array.isArray(nodes)) {
            returnNode = nodes.find((n) => n.id.toString() === id.toString());
            if (!returnNode) {
                for (const node of nodes) {
                    if (node.children && Array.isArray(node.children)) {
                        returnNode = this.findNode(id, node.children);
                        if (returnNode) {
                            break;
                        }
                    }
                }
            }
        }
        return returnNode;
    }

    public nodesChanged(nodes: TreeNode[]): void {
        const currentNodes = nodes && nodes.length ? nodes : [];
        if (!!currentNodes.length) {
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
        const autocompleteOption = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
        );

        if (typeof autocompleteOption !== 'undefined' && autocompleteOption !== null) {
            if (autocompleteOption.value) {
                this.autocomplete = true;
                this.state.autoCompleteConfiguration = new AutoCompleteConfiguration();
            }
        }

        const isMultiselectOption = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.MULTISELECT
        );
        this.state.multiselect = typeof isMultiselectOption === 'undefined'
            || isMultiselectOption === null ? false : isMultiselectOption.value;

        const freeTextOption = this.state.field.options.find(
            (o) => o.option === ObjectReferenceOptions.FREETEXT
        );
        if (typeof freeTextOption !== 'undefined' && freeTextOption !== null) {
            this.state.freeText = freeTextOption.value;
        }
    }

    private async search(limit: number, searchValue: string): Promise<TreeNode[]> {
        let nodes = [];
        const objectOption = this.state.field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        if (objectOption) {
            if (this.autocomplete) {
                const objectType = objectOption.value as KIXObjectType;

                const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
                let filter: FilterCriteria[];
                if (service) {
                    filter = await service.prepareFullTextFilter(searchValue);
                }
                const fieldLoadingOptions = this.state.field.options.find(
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
                                return new FilterCriteria(f.property, f.operator, f.type, f.filterType, searchValue);
                            } else {
                                return f;
                            }
                        }),
                        ...filter
                    ];
                } else {
                    loadingOptions.filter = filter;
                }
                loadingOptions.limit = limit;

                this.objects = await KIXObjectService.loadObjects<KIXObject>(
                    objectType, null, loadingOptions, null, false
                );

                if (searchValue && searchValue !== '') {
                    const structureOption = this.state.field.options.find(
                        (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
                    );
                    if (structureOption && structureOption.value) {
                        nodes = await KIXObjectService.prepareObjectTree(this.objects);
                    } else {
                        for (const o of this.objects) {
                            const node = await this.createTreeNode(o);
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

    private async createTreeNode(o: KIXObject): Promise<TreeNode> {
        if (typeof o === 'string') {
            return new TreeNode(o, o);
        } else {
            const showInvalid = this.showInvalidNodes();
            // typeof o.ValidID === 'undefined' - needed for objects without ValidID like ValidObject
            if (typeof o.ValidID === 'undefined' || o.ValidID === 1 || showInvalid) {
                const invalidClickable = this.areInvalidClickable();
                const text = await LabelService.getInstance().getText(o);
                const icon = LabelService.getInstance().getObjectIcon(o);
                let tooltip = await LabelService.getInstance().getTooltip(o);

                tooltip = (tooltip && tooltip !== text) ? text + ": " + tooltip : text;
                return new TreeNode(
                    o.ObjectId, text ? text : `${o.KIXObjectType}: ${o.ObjectId}`, icon, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    typeof o.ValidID === 'undefined' || o.ValidID === 1 || invalidClickable,
                    tooltip, undefined, undefined, undefined,
                    typeof o.ValidID !== 'undefined' && o.ValidID !== 1
                );
            } else {
                return;
            }
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

}

module.exports = Component;
