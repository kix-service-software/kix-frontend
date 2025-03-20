/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { MacroActionType } from '../../../macro/model/MacroActionType';
import { Macro } from '../../../macro/model/Macro';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { MacroType } from '../../../macro/model/MacroType';
import { OptionFieldHandler } from '../../model/OptionFieldHandler';
import { MacroProperty } from '../../model/MacroProperty';

export class MacroService extends KIXObjectService<Macro> {

    private static INSTANCE: MacroService = null;

    public static getInstance(): MacroService {
        if (!MacroService.INSTANCE) {
            MacroService.INSTANCE = new MacroService();
        }

        return MacroService.INSTANCE;
    }

    private optionFieldHandler: OptionFieldHandler[] = [];

    private constructor() {
        super(KIXObjectType.MACRO);
        this.objectConstructors.set(KIXObjectType.MACRO, [Macro]);
        this.objectConstructors.set(KIXObjectType.MACRO_ACTION_TYPE, [MacroActionType]);
        this.objectConstructors.set(KIXObjectType.MACRO_TYPE, [MacroType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MACRO
            || kixObjectType === KIXObjectType.MACRO_ACTION_TYPE
            || kixObjectType === KIXObjectType.MACRO_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Macro';
    }

    public registerOptionFieldHandler(handler: OptionFieldHandler): void {
        this.optionFieldHandler.push(handler);
    }

    public getOptionFieldHandler(): OptionFieldHandler[] {
        return this.optionFieldHandler;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent: boolean = false, collectionId?: string
    ): Promise<O[]> {
        let objects: O[];
        if (objectType === KIXObjectType.MACRO_TYPE) {
            objects = await super.loadObjects<O>(
                objectType, null, loadingOptions, objectLoadingOptions,
                cache, forceIds, silent, collectionId
            );
            if (objectIds) {
                objects = objects.filter(
                    (c) => objectIds.map((id) => isNaN(Number(id)) ? id : Number(id)).some((oid) => c.ObjectId === oid)
                );
            }
        } else {
            objects = await super.loadObjects(
                objectType, objectIds, loadingOptions, objectLoadingOptions,
                cache, forceIds, silent, collectionId
            );
        }

        return objects as any[];
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        if (property === MacroProperty.ACTIONS) {
            const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                KIXObjectType.MACRO_ACTION_TYPE, undefined, null, objectLoadingOptions, true
            ).catch((error): MacroActionType[] => []);

            if (macroActionTypes && !!macroActionTypes.length) {
                nodes = macroActionTypes.map((mat) => new TreeNode(mat.Name, mat.DisplayName));
            }
        }

        return nodes;
    }

}
