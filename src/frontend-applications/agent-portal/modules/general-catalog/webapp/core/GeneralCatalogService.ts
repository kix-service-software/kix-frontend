/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { GeneralCatalogItem } from '../../model/GeneralCatalogItem';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { GeneralCatalogItemProperty } from '../../model/GeneralCatalogItemProperty';

export class GeneralCatalogService extends KIXObjectService<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.GENERAL_CATALOG_ITEM);
        this.objectConstructors.set(KIXObjectType.GENERAL_CATALOG_ITEM, [GeneralCatalogItem]);
    }

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.GENERAL_CATALOG_ITEM
            || type === KIXObjectType.GENERAL_CATALOG_CLASS;
    }

    public getLinkObjectName(): string {
        return 'GeneralCatalogItem';
    }

    public async getTreeNodes(property: string, showInvalid: boolean = false): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case GeneralCatalogItemProperty.CLASS:
                const types = await this.loadObjects(KIXObjectType.GENERAL_CATALOG_CLASS, null);
                nodes = types ? types.map((t) => new TreeNode(t, t.toString())) : [];
                break;
            default:
        }

        return nodes;
    }
}
