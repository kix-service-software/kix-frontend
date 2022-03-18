/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { DataType } from '../../../../../model/DataType';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../model/SortUtil';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { ContextService } from '../../core/ContextService';
import { IKIXObjectService } from '../../core/IKIXObjectService';
import { KIXObjectService } from '../../core/KIXObjectService';
import { LabelService } from '../../core/LabelService';
import { ObjectReferenceOptions } from '../../core/ObjectReferenceOptions';
import { PlaceholderService } from '../../core/PlaceholderService';
import { ServiceRegistry } from '../../core/ServiceRegistry';
import { TreeNode } from '../../core/tree';
import { UIUtil } from '../../core/UIUtil';

export class ObjectReferenceUtil {

    public static async searchObjects(
        limit: number, searchValue: string, options: FormFieldOption[] = []
    ): Promise<KIXObject[]> {
        let objects: KIXObject[] = [];
        const objectOption = options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const objectIdOption = options.find((o) => o.option === ObjectReferenceOptions.OBJECT_IDS);
        const objectIds = objectIdOption && Array.isArray(objectIdOption.value) && objectIdOption.value.length
            ? objectIdOption.value
            : null;

        const autocompleteOption = options.find(
            (o) => o.option === ObjectReferenceOptions.AUTOCOMPLETE
        );
        let autocomplete: boolean = false;
        let autoCompleteConfiguration: AutoCompleteConfiguration;
        if (typeof autocompleteOption !== 'undefined' && autocompleteOption !== null && autocompleteOption.value) {
            autocomplete = true;
            autoCompleteConfiguration = autocompleteOption.value;
            if (typeof autoCompleteConfiguration === 'object') {
                autoCompleteConfiguration = autocompleteOption.value;
            } else {
                autoCompleteConfiguration = new AutoCompleteConfiguration();
            }
        }

        if (objectOption && autocomplete) {
            const objectType = objectOption.value as KIXObjectType;

            const fieldLoadingOptions = options.find(
                (o) => o.option === ObjectReferenceOptions.LOADINGOPTIONS
            );
            const loadingOptions: KIXObjectLoadingOptions = fieldLoadingOptions
                ? { ...fieldLoadingOptions.value }
                : new KIXObjectLoadingOptions();

            const specificLoadingOptions = options.find(
                (o) => o.option === ObjectReferenceOptions.OBJECT_SPECIFIC_LOADINGOPTIONS
            );


            const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(objectType);
            const filter = service && searchValue
                ? await service.prepareFullTextFilter(searchValue)
                : null;

            if (Array.isArray(loadingOptions.filter)) {
                loadingOptions.filter = [...loadingOptions.filter, ...filter];
            } else {
                loadingOptions.filter = filter;
            }

            loadingOptions.limit = autoCompleteConfiguration.limit;

            const preparedOptions = await this.prepareLoadingOptions(loadingOptions, searchValue);
            objects = await KIXObjectService.loadObjects<KIXObject>(
                objectType, objectIds, preparedOptions, specificLoadingOptions?.value, false
            );
        }

        return objects;
    }

    private static async prepareLoadingOptions(
        loadingOptions: KIXObjectLoadingOptions, searchValue: string
    ): Promise<KIXObjectLoadingOptions> {
        const preparedLoadingOptions = new KIXObjectLoadingOptions(
            [],
            loadingOptions.sortOrder,
            loadingOptions.limit,
            loadingOptions.includes,
            loadingOptions.expands,
            []
        );

        const context = ContextService.getInstance().getActiveContext();
        const contextObject = await context.getObject();

        if (Array.isArray(loadingOptions.filter)) {
            for (const criterion of loadingOptions.filter) {
                if (typeof criterion.value === 'string') {
                    const preparedCriterion = new FilterCriteria(
                        criterion.property, criterion.operator, criterion.type, criterion.filterType, criterion.value
                    );

                    preparedCriterion.value = await PlaceholderService.getInstance().replacePlaceholders(
                        criterion.value, contextObject
                    );
                    preparedCriterion.value = preparedCriterion.value.replace(SearchProperty.SEARCH_VALUE, searchValue);
                    if (preparedCriterion.operator === SearchOperator.LIKE) {
                        preparedCriterion.value = `*${preparedCriterion.value}*`;
                    }
                    preparedLoadingOptions.filter.push(preparedCriterion);
                } else {
                    preparedLoadingOptions.filter.push(criterion);
                }
            }
        }

        if (Array.isArray(loadingOptions.query)) {
            for (const q of loadingOptions.query) {
                const newQuery: [string, string] = [q[0], ''];
                newQuery[1] = await PlaceholderService.getInstance().replacePlaceholders(q[1], contextObject);
                newQuery[1] = newQuery[1].replace(SearchProperty.SEARCH_VALUE, searchValue);
                preparedLoadingOptions.query.push(newQuery);
            }
        }

        return preparedLoadingOptions;
    }

    public static async createTreeNodes(
        objects: KIXObject[], showInvalidNodes: boolean, isInvalidClickable: boolean, useTextAsId: boolean,
        options: FormFieldOption[] = []
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const objectOption = options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
        const structureOption = options.find(
            (o) => o.option === ObjectReferenceOptions.USE_OBJECT_SERVICE
        );
        const translatableOption = options.find(
            (o) => o.option === ObjectReferenceOptions.TRANSLATABLE
        );
        const translatable = !translatableOption || Boolean(translatableOption.value);
        const objectId = await UIUtil.getEditObjectId(objectOption?.value);
        if (structureOption && structureOption.value) {
            nodes = await KIXObjectService.prepareObjectTree(
                objectOption?.value, objects, showInvalidNodes, isInvalidClickable,
                objectId ? [objectId] : null, translatable
            );
        } else {
            for (const o of objects) {
                const node = await ObjectReferenceUtil.createTreeNode(o,
                    showInvalidNodes, isInvalidClickable, useTextAsId,
                    translatable, objectId ? [objectId] : undefined
                );
                if (node) {
                    nodes.push(node);
                }
            }
        }
        nodes = SortUtil.sortObjects(nodes, 'label', DataType.STRING);

        return nodes;
    }

    public static async createTreeNode(
        object: KIXObject, showInvalid: boolean, invalidClickable: boolean, useTextAsId: boolean,
        translatable?: boolean, filterIds: any[] = []
    ): Promise<TreeNode> {
        let node: TreeNode;

        showInvalid = (typeof object.ValidID === 'undefined' || object.ValidID === 1 || showInvalid);

        if (typeof object === 'string') {
            node = new TreeNode(object, object);
        } else if (showInvalid && !filterIds.some((id) => id === object.ObjectId)) {
            const text = await LabelService.getInstance().getObjectText(object, undefined, undefined, translatable);
            const icon = LabelService.getInstance().getObjectIcon(object);
            let tooltip = await LabelService.getInstance().getTooltip(object, translatable);
            let textAsId;
            if (useTextAsId) {
                textAsId = await LabelService.getInstance().getObjectText(object, undefined, undefined, false);
            }

            tooltip = (tooltip && tooltip !== text) ? text + ': ' + tooltip : text;
            node = new TreeNode(
                textAsId || object.ObjectId,
                text ? text : object.ObjectId?.toString(),
                icon,
                undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                typeof object.ValidID === 'undefined' || object.ValidID === 1 || invalidClickable,
                tooltip, undefined, undefined, undefined,
                typeof object.ValidID !== 'undefined' && object.ValidID !== 1
            );
        }

        return node;
    }

}
