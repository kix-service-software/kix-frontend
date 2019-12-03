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
import { KIXObjectType, CRUD, ContextDescriptor, ContextMode, ContextType } from "../../../model";
import { LabelService } from "../../LabelService";
import { TableFactoryService } from "../../table";
import {
    MailAccountService, MailAccountFormService, MailAccountTableFactory,
    MailAccountLabelProvider, MailAccountBrowserFactory, MailAccountCreateAction, NewMailAccountDialogContext,
    MailAccountEditAction, EditMailAccountDialogContext, MailAccountDetailsContext, MailAccountFetchAction
} from "../../mail-account";
import { ActionFactory } from "../../ActionFactory";
import { ContextService } from "../../context";
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

    public name: string = 'CommunicationUIModule';

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

        ActionFactory.getInstance().registerAction('system-address-create', SystemAddressCreateAction);

        const newSystemAddressDialogContext = new ContextDescriptor(
            NewSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-system-address-dialog', ['system-addresses'], NewSystemAddressDialogContext
        );
        await ContextService.getInstance().registerContext(newSystemAddressDialogContext);

        ActionFactory.getInstance().registerAction('system-address-edit', SystemAddressEditAction);

        const editSystemAddressDialogContext = new ContextDescriptor(
            EditSystemAddressDialogContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-system-address-dialog', ['system-addresses'], EditSystemAddressDialogContext
        );
        await ContextService.getInstance().registerContext(editSystemAddressDialogContext);

        const systemAddressDetailsContext = new ContextDescriptor(
            SystemAddressDetailsContext.CONTEXT_ID, [KIXObjectType.SYSTEM_ADDRESS],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['system-addresses'], SystemAddressDetailsContext
        );
        await ContextService.getInstance().registerContext(systemAddressDetailsContext);
    }

    private async registerMailAccounts(): Promise<void> {

        ActionFactory.getInstance().registerAction('mail-account-create', MailAccountCreateAction);

        const newMailAccountDialogContext = new ContextDescriptor(
            NewMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-mail-account-dialog', ['mail-accounts'], NewMailAccountDialogContext
        );
        await ContextService.getInstance().registerContext(newMailAccountDialogContext);

        ActionFactory.getInstance().registerAction('mail-account-edit', MailAccountEditAction);
        ActionFactory.getInstance().registerAction('mail-account-fetch', MailAccountFetchAction);

        const editMailAccountDialogContext = new ContextDescriptor(
            EditMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-mail-account-dialog', ['mail-accounts'], EditMailAccountDialogContext
        );
        await ContextService.getInstance().registerContext(editMailAccountDialogContext);

        const mailAccountDetailsContext = new ContextDescriptor(
            MailAccountDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-accounts'], MailAccountDetailsContext
        );
        await ContextService.getInstance().registerContext(mailAccountDetailsContext);
    }

    private async registerMailFilters(): Promise<void> {

        ActionFactory.getInstance().registerAction('mail-filter-create', MailFilterCreateAction);

        const newMailFilterDialogContext = new ContextDescriptor(
            NewMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'new-mail-account-dialog', ['mail-filters'], NewMailFilterDialogContext
        );
        await ContextService.getInstance().registerContext(newMailFilterDialogContext);

        ActionFactory.getInstance().registerAction('mail-filter-edit', MailFilterEditAction);

        const editMailFilterDialogContext = new ContextDescriptor(
            EditMailFilterDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'edit-mail-filter-dialog', ['mail-filters'], EditMailFilterDialogContext
        );
        await ContextService.getInstance().registerContext(editMailFilterDialogContext);

        const mailFilterDetailsContext = new ContextDescriptor(
            MailFilterDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_FILTER],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-filters'], MailFilterDetailsContext
        );
        await ContextService.getInstance().registerContext(mailFilterDetailsContext);

    }
}
