/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../model/DynamicField';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { DynamicFieldType } from '../../model/DynamicFieldType';

export class DynamicFieldService extends KIXObjectService<DynamicField> {

    private schema: Map<string, any> = new Map();
    private schemaHandler: Map<string, () => Promise<void>> = new Map();

    private static INSTANCE: DynamicFieldService = null;

    public static getInstance(): DynamicFieldService {
        if (!DynamicFieldService.INSTANCE) {
            DynamicFieldService.INSTANCE = new DynamicFieldService();
        }

        return DynamicFieldService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.DYNAMIC_FIELD);
        this.objectConstructors.set(KIXObjectType.DYNAMIC_FIELD, [DynamicField]);
        this.objectConstructors.set(KIXObjectType.DYNAMIC_FIELD_TYPE, [DynamicFieldType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.DYNAMIC_FIELD
            || kixObjectType === KIXObjectType.DYNAMIC_FIELD_TYPE;
    }

    public getLinkObjectName(): string {
        return 'DynamicField';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[] = await super.loadObjects<O>(objectType, null, loadingOptions, objectLoadingOptions);
        if (objectIds) {
            objects = objects.filter(
                (c) => objectIds.map((id) => isNaN(Number(id)) ? id : Number(id)).some((oid) => c.ObjectId === oid)
            );
        }

        return objects as any[];
    }

    public registerConfigSchema(id: string, schema: any): void {
        this.schema.set(id, schema);
    }

    public registerConfigSchemaHandler(id: string, handler: () => Promise<any>): void {
        this.schemaHandler.set(id, handler);
    }

    public async getConfigSchema(id: string): Promise<any> {
        let schema = this.schema.get(id);
        if (!schema) {
            const handler = this.schemaHandler.get(id);
            if (handler) {
                schema = await handler();
            }
        }
        return schema;
    }

    public hasConfigSchema(id: string): boolean {
        return this.schema.has(id) || this.schemaHandler.has(id);
    }

    public async prepareObjectTree(
        dynamicFieldType: DynamicFieldType[], showInvalid?: boolean,
        invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (dynamicFieldType && !!dynamicFieldType.length) {
            for (const type of dynamicFieldType) {
                const fieldType = type.Name;
                if (this.hasConfigSchema(fieldType)) {
                    const label = await LabelService.getInstance().getObjectText(type);
                    const icon = LabelService.getInstance().getObjectIcon(type);
                    nodes.push(new TreeNode(fieldType, label, icon));
                }
            }
        }
        return nodes;
    }
}
