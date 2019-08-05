/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../kix";
import { GeneralCatalogItem } from "../../model";

export class GeneralCatalogBrowserFactory implements IKIXObjectFactory<GeneralCatalogItem> {

    private static INSTANCE: GeneralCatalogBrowserFactory;

    public static getInstance(): GeneralCatalogBrowserFactory {
        if (!GeneralCatalogBrowserFactory.INSTANCE) {
            GeneralCatalogBrowserFactory.INSTANCE = new GeneralCatalogBrowserFactory();
        }
        return GeneralCatalogBrowserFactory.INSTANCE;
    }

    public async create(item: GeneralCatalogItem): Promise<GeneralCatalogItem> {
        return new GeneralCatalogItem(item);
    }

}
