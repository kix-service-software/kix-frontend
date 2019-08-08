/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../application/IUIModule";
import { ServiceRegistry, FactoryService } from "../../kix";
import {
    SystemAddressService, SystemAddressFormService, SystemAddressBrowserFactory,
    SystemAddressTableFactory, SystemAddressLabelProvider, SystemAddressCreateAction,
    NewSystemAddressDialogContext, SystemAddressEditAction, EditSystemAddressDialogContext,
    SystemAddressDetailsContext
} from "../../system-address";
import {
    KIXObjectType, CRUD, ContextDescriptor, ContextMode, ContextType, ConfiguredDialogWidget, WidgetConfiguration
} from "../../../model";
import { LabelService } from "../../LabelService";
import { TableFactoryService } from "../../table";
import {
    MailAccountService, MailAccountFormService, MailAccountTableFactory,
    MailAccountLabelProvider, MailAccountBrowserFactory, MailAccountCreateAction, NewMailAccountDialogContext,
    MailAccountEditAction, EditMailAccountDialogContext, MailAccountDetailsContext
} from "../../mail-account";
import { ActionFactory } from "../../ActionFactory";
import { ContextService } from "../../context";
import { DialogService } from "../../components";
import { UIComponentPermission } from "../../../model/UIComponentPermission";
import { AuthenticationSocketClient } from "../../application/AuthenticationSocketClient";
import {
    MailFilterService, MailFilterBrowserFactory, MailFilterTableFactory, MailFilterLabelProvider
} from "../../mail-filter";
import { MailFilterMatchTableFactory } from "../../mail-filter/table/MailFilterMatchTableFactory";
import { MailFilterSetTableFactory } from "../../mail-filter/table/MailFilterSetTableFactory";
import { MailFilterCreateAction, MailFilterEditAction } from "../../mail-filter/actions";
import {
    NewMailFilterDialogContext, MailFilterDetailsContext, EditMailFilterDialogContext
} from "../../mail-filter/context";
import { MailFilterFormService } from "../../mail-filter/MailFilterFormService";

export class UIModule implements IUIModule {

    public priority: number = 52;

    public unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(SystemAddressService.getInstance());
        ServiceRegistry.registerServiceInstance(SystemAddressFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.SYSTEM_ADDRESS, SystemAddressBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new SystemAddressTableFactory());
        LabelService.getInstance().registerLabelProvider(new SystemAddressLabelProvider());

        ServiceRegistry.registerServiceInstance(MailAccountService.getInstance());
        ServiceRegistry.registerServiceInstance(MailAccountFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_ACCOUNT, MailAccountBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailAccountLabelProvider());

        ServiceRegistry.registerServiceInstance(MailFilterService.getInstance());
        ServiceRegistry.registerServiceInstance(MailFilterFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_FILTER, MailFilterBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailFilterTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailFilterLabelProvider());
        TableFactoryService.getInstance().registerFactory(new MailFilterMatchTableFactory());
        TableFactoryService.getInstance().registerFactory(new MailFilterSetTableFactory());

        await this.registerSystemAddresses();
        await this.registerMailAccounts();
        await this.registerMailFilters();
    }

    private async registerSystemAddresses(): Promise<void> {

        if (await this.checkPermission('system/communication/systemaddresses', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('system-address-create', SystemAddressCreateAction);

            const newSystemAddressDialogContext = new ContextDescriptor(
                NewSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-system-address-dialog', ['system-addresses'], NewSystemAddressDialogContext
            );
            ContextService.getInstance().registerContext(newSystemAddressDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-system-address-dialog',
                new WidgetConfiguration(
                    'new-system-address-dialog', 'Translatable#New Address',
                    [], {}, false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/systemaddresses/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('system-address-edit', SystemAddressEditAction);

            const editSystemAddressDialogContext = new ContextDescriptor(
                EditSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-system-address-dialog', ['system-addresses'], EditSystemAddressDialogContext
            );
            ContextService.getInstance().registerContext(editSystemAddressDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-system-address-dialog',
                new WidgetConfiguration(
                    'edit-system-address-dialog', 'Translatable#Edit Address',
                    [], {}, false, false, 'kix-icon-edit'
                ),
                KIXObjectType.SYSTEM_ADDRESS,
                ContextMode.EDIT_ADMIN
            ));
        }

        const systemAddressDetailsContext = new ContextDescriptor(
            SystemAddressDetailsContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['system-addresses'], SystemAddressDetailsContext
        );
        ContextService.getInstance().registerContext(systemAddressDetailsContext);
    }

    private async registerMailAccounts(): Promise<void> {

        if (await this.checkPermission('system/communication/mailaccounts', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('mail-account-create', MailAccountCreateAction);

            const newMailAccountDialogContext = new ContextDescriptor(
                NewMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-mail-account-dialog', ['mail-accounts'], NewMailAccountDialogContext
            );
            ContextService.getInstance().registerContext(newMailAccountDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-mail-account-dialog',
                new WidgetConfiguration(
                    'new-mail-account-dialog', 'Translatable#New Account',
                    [], {}, false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.MAIL_ACCOUNT,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/mailaccounts/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('mail-account-edit', MailAccountEditAction);

            const editMailAccountDialogContext = new ContextDescriptor(
                EditMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-mail-account-dialog', ['mail-accounts'], EditMailAccountDialogContext
            );
            ContextService.getInstance().registerContext(editMailAccountDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-mail-account-dialog',
                new WidgetConfiguration(
                    'edit-mail-account-dialog', 'Translatable#Edit Account',
                    [], {}, false, false, 'kix-icon-edit'
                ),
                KIXObjectType.MAIL_ACCOUNT,
                ContextMode.EDIT_ADMIN
            ));
        }

        const mailAccountDetailsContext = new ContextDescriptor(
            MailAccountDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-accounts'], MailAccountDetailsContext
        );
        ContextService.getInstance().registerContext(mailAccountDetailsContext);
    }

    private async registerMailFilters(): Promise<void> {

        if (await this.checkPermission('system/communication/mailfilters', CRUD.CREATE)) {
            ActionFactory.getInstance().registerAction('mail-filter-create', MailFilterCreateAction);

            const newMailFilterDialogContext = new ContextDescriptor(
                NewMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
                ContextType.DIALOG, ContextMode.CREATE_ADMIN,
                false, 'new-mail-account-dialog', ['mail-filters'], NewMailFilterDialogContext
            );
            ContextService.getInstance().registerContext(newMailFilterDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'new-mail-filter-dialog',
                new WidgetConfiguration(
                    'new-mail-filter-dialog', 'Translatable#New Email Filter',
                    [], {}, false, false, 'kix-icon-new-gear'
                ),
                KIXObjectType.MAIL_FILTER,
                ContextMode.CREATE_ADMIN
            ));
        }

        if (await this.checkPermission('system/communication/mailfilters/*', CRUD.UPDATE)) {
            ActionFactory.getInstance().registerAction('mail-filter-edit', MailFilterEditAction);

            const editMailFilterDialogContext = new ContextDescriptor(
                EditMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
                ContextType.DIALOG, ContextMode.EDIT_ADMIN,
                false, 'edit-mail-filter-dialog', ['mail-filters'], EditMailFilterDialogContext
            );
            ContextService.getInstance().registerContext(editMailFilterDialogContext);

            DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
                'edit-mail-filter-dialog',
                new WidgetConfiguration(
                    'edit-mail-filter-dialog', 'Translatable#Edit Email Filter',
                    [], {}, false, false, 'kix-icon-edit'
                ),
                KIXObjectType.MAIL_FILTER,
                ContextMode.EDIT_ADMIN
            ));
        }

        const mailFilterDetailsContext = new ContextDescriptor(
            MailFilterDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-filters'], MailFilterDetailsContext
        );
        ContextService.getInstance().registerContext(mailFilterDetailsContext);

    }

    private async checkPermission(resource: string, crud: CRUD): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, [crud])]
        );
    }
}
