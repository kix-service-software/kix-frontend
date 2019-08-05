/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import { KIXObjectType, GeneralCatalogItem } from "../../model";

export class GeneralCatalogService extends KIXObjectService<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogService;

    public static getInstance(): GeneralCatalogService {
        if (!GeneralCatalogService.INSTANCE) {
            GeneralCatalogService.INSTANCE = new GeneralCatalogService();
        }
        return GeneralCatalogService.INSTANCE;
    }

    public isServiceFor(type: KIXObjectType) {
        return type === KIXObjectType.GENERAL_CATALOG_ITEM;
    }

    public getLinkObjectName(): string {
        return "GeneralCatalogItem";
    }
}
