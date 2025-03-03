/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { DynamicFieldProperty } from '../../model/DynamicFieldProperty';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { Error } from '../../../../../../server/model/Error';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { CheckListItem } from '../../model/CheckListItem';
import { DynamicFieldFormService } from './DynamicFieldFormService';

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
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: O[] = await super.loadObjects<O>(
            objectType, null, loadingOptions, objectLoadingOptions, undefined, undefined, undefined, collectionId
        );

        if (objectIds) {
            objects = objects.filter(
                (c) => objectIds.map((id) => isNaN(Number(id)) ? id : Number(id)).some((oid) => c.ObjectId === oid)
            );
        }

        return objects as any[];
    }

    public async updateObject(
        objectType: KIXObjectType | string, parameter: Array<[string, any]>, objectId: number,
        cacheKeyPrefix: string = objectType, silent?: boolean
    ): Promise<string | number> {
        const dynamicField = await KIXObjectService.loadDynamicField(null, objectId);
        const dfName = parameter.find((p) => p[0] === DynamicFieldProperty.NAME);

        let id;
        if (dfName && dfName[1] !== dynamicField.Name) {
            const askForUpdatePromise = new Promise<number>((resolve, reject) => {
                BrowserUtil.openConfirmOverlay(
                    'Translatable#Warning', 'Translatable#Admin_DynamicField_Edit_Name_Hint',
                    async () => {
                        const id = await super.updateObject(
                            objectType, parameter, objectId, cacheKeyPrefix, silent
                        ).catch((e) => reject(e));

                        resolve(Number(id));
                    },
                    async () => {
                        const msg = await TranslationService.translate('Translatable#Aborted by user.');
                        reject(new Error('', msg));
                    },
                    ['OK', 'Cancel']
                );
            });
            id = await askForUpdatePromise;
        } else {
            id = await super.updateObject(objectType, parameter, objectId, cacheKeyPrefix, silent);
        }

        return id;
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

    public static parseChecklist(value: any): CheckListItem[] {
        let newValue: CheckListItem[] = [];
        if (typeof value === 'string') {
            newValue = JSON.parse(value);
        } else {
            newValue = value;
        }

        if (!Array.isArray(newValue) && newValue) {
            newValue = [newValue];
        }

        if (Array.isArray(newValue)) {
            const checklist = [];
            for (const checklistItem of newValue) {
                checklist.push(new CheckListItem(checklistItem));
            }
            newValue = checklist;
            DynamicFieldFormService.prepareChecklistConfig(newValue);
        }

        return newValue;
    }
}
