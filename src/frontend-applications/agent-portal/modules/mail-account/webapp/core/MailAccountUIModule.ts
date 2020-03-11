/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    MailAccountFormService, MailAccountBrowserFactory, MailAccountTableFactory, MailAccountLabelProvider,
    MailAccountCreateAction, NewMailAccountDialogContext, MailAccountEditAction, MailAccountFetchAction,
    EditMailAccountDialogContext, MailAccountDetailsContext
} from ".";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { MailAccountService } from "./MailAccountService";

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'MailAccountUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(MailAccountService.getInstance());
        ServiceRegistry.registerServiceInstance(MailAccountFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_ACCOUNT, MailAccountBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailAccountLabelProvider());

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
}
