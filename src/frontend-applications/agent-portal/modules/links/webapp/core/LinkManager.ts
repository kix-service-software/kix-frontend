/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LinkService } from '.';
import { InputFieldTypes } from '../../../base-components/webapp/core/InputFieldTypes';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { CreateLinkDescription } from '../../server/api/CreateLinkDescription';
import { LinkTypeDescription } from '../../model/LinkTypeDescription';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { BulkDialogContext, BulkService } from '../../../bulk/webapp/core';

export class LinkManager extends AbstractDynamicFormManager {

    public objectType: string = KIXObjectType.LINK;

    public uniqueProperties: boolean = false;
    public useOwnSearch: boolean = true;

    public constructor(private targetObjectType) {
        super();
    }

    public async getProperties(validDynamicFields: boolean = true): Promise<Array<[string, string]>> {
        const linkableObjects = await LinkService.getPossibleLinkPartners(this.targetObjectType);
        const properties: Array<[string, string]> = linkableObjects.map((lo) => [lo[1], lo[0]]);
        return properties;
    }

    public async getOperations(property: string): Promise<string[]> {
        const types = [];
        const linkTypes = await LinkService.getLinkTypes(this.targetObjectType, property);

        linkTypes.forEach((lt) => {
            types.push(lt.SourceName);
            if (lt.Pointed) {
                types.push(lt.TargetName);
            }
        });

        return types;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return Boolean(value.property);
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return InputFieldTypes.OBJECT_REFERENCE;
    }

    public async searchObjectTree(
        property: string, searchValue: string, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        const tree = await KIXObjectService.searchObjectTree(property, null, searchValue, loadingOptions);
        return tree;
    }

    public async isMultiselect(
        property: string, operator: SearchOperator | string, forSearch?: boolean
    ): Promise<boolean> {
        return true;
    }

    public async prepareLinkDesriptions(): Promise<CreateLinkDescription[]> {
        const linkDescriptions: CreateLinkDescription[] = [];

        const values = await this.getEditableValues();
        for (const v of values.filter((v) => v.property && v.operator && v.value)) {
            const linkTypes = await LinkService.getLinkTypes(this.targetObjectType, v.property);
            const linkType = linkTypes.find((lt) => lt.TargetName === v.operator || lt.SourceName === v.operator);

            const isSource = linkType.SourceName === v.operator;

            const objectIds = Array.isArray(v.value) ? v.value : [v.value];

            objectIds.forEach((oid) => {
                const object = { ObjectId: oid };
                linkDescriptions.push(
                    new CreateLinkDescription(object as any, new LinkTypeDescription(linkType, isSource))
                );
            });
        }

        return linkDescriptions;
    }

    public reset(notify?: boolean, force: boolean = false): void {
        if (force) {
            super.reset(notify);
            return;
        }
        if (ContextService.getInstance().hasContextInstance(BulkDialogContext.CONTEXT_ID)
            && this.values.length > 1) return;
        super.reset(notify);
        BulkService.getInstance().removeLinkManager(this);
    }

}
