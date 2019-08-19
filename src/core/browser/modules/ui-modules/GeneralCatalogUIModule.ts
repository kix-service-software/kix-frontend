/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService, TableFactoryService, LabelService } from "../..";
import { GeneralCatalogService, GeneralCatalogBrowserFactory } from '../../../../core/browser/general-catalog';
import { KIXObjectType } from "../../../model";
import { SearchService } from "../../kix/search/SearchService";
import { GeneralCatalogTableFactory } from "../../general-catalog/table";
import { GeneralCatalogLabelProvider } from "../../general-catalog/GeneralCatalogLabelProvider";

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(GeneralCatalogService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new GeneralCatalogTableFactory());
        LabelService.getInstance().registerLabelProvider(new GeneralCatalogLabelProvider());

        this.registerContexts();
        this.registerDialogs();
        await this.registerBookmarks();
    }

    // tslint:disable-next-line:no-empty
    public registerContexts(): void {
    }

    // tslint:disable-next-line:no-empty
    private registerDialogs(): void {
    }

    private async registerBookmarks(): Promise<void> {
        await SearchService.getInstance().getSearchBookmarks(true);
    }

}
