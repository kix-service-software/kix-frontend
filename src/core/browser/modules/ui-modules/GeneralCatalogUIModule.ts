/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextService, DialogService, ActionFactory,
    TableFactoryService, LabelService, ServiceRegistry, FactoryService
} from "../../../../core/browser";
import {
    KIXObjectType, ContextDescriptor, ContextType, ContextMode, ConfiguredDialogWidget, WidgetConfiguration, CRUD
} from "../../../../core/model";
import { AuthenticationSocketClient } from "../../../../core/browser/application/AuthenticationSocketClient";
import { UIComponentPermission } from "../../../../core/model/UIComponentPermission";
import { IUIModule } from "../../application/IUIModule";
import {
    GeneralCatalogBrowserFactory, GeneralCatalogTableFactory,
    GeneralCatalogLabelProvider, GeneralCatalogService, GeneralCatalogCreateAction, GeneralCatalogFormService
} from "../../general-catalog";
import { NewGeneralCatalogDialogContext, EditGeneralCatalogDialogContext } from "../../general-catalog/context";
import { SearchService } from "../../kix/search/SearchService";

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(GeneralCatalogService.getInstance());
        ServiceRegistry.registerServiceInstance(GeneralCatalogFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.GENERAL_CATALOG_ITEM, GeneralCatalogBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new GeneralCatalogTableFactory());
        LabelService.getInstance().registerLabelProvider(new GeneralCatalogLabelProvider());

        if (await this.checkPermission('system/generalcatalog', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('cmdb-admin-general-catalog-create', GeneralCatalogCreateAction);

            const newGeneralCatalogDialogContext = new ContextDescriptor(
                NewGeneralCatalogDialogContext.CONTEXT_ID, [KIXObjectType.GENERAL_CATALOG_ITEM],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                true, 'new-general-catalog-dialog', ['generalcatalog'], NewGeneralCatalogDialogContext
            );
            ContextService.getInstance().registerContext(newGeneralCatalogDialogContext);
            const editGeneralCatalogDialogContext = new ContextDescriptor(
                EditGeneralCatalogDialogContext.CONTEXT_ID, [KIXObjectType.GENERAL_CATALOG_ITEM],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                true, 'edit-general-catalog-dialog', ['generalcatalog'], EditGeneralCatalogDialogContext
            );
            ContextService.getInstance().registerContext(editGeneralCatalogDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-general-catalog-dialog',
                new WidgetConfiguration(
                    'new-general-catalog-dialog', 'Translatable#New Value', [], {}, false, false,
                    'kix-icon-new-gear'
                ),
                KIXObjectType.GENERAL_CATALOG_ITEM,
                ContextMode.CREATE_ADMIN
            ));

            if (await this.checkPermission('system/generalcatalog/*', CRUD.UPDATE)) {
                DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                    'edit-general-catalog-dialog',
                    new WidgetConfiguration(
                        'edit-general-catalog-dialog', 'Translatable#Edit Value', [], {}, false, false,
                        'kix-icon-edit'
                    ),
                    KIXObjectType.GENERAL_CATALOG_ITEM,
                    ContextMode.EDIT_ADMIN
                ));
            }
        }
    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }
}
