/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from "../../../../model/IUIModule";
import { ServiceRegistry } from "../../../../modules/base-components/webapp/core/ServiceRegistry";
import {
    MailFilterService, MailFilterBrowserFactory, MailFilterTableFactory, MailFilterLabelProvider,
    MailFilterMatchTableFactory, MailFilterSetTableFactory, MailFilterCreateAction, NewMailFilterDialogContext,
    MailFilterEditAction, EditMailFilterDialogContext, MailFilterDetailsContext
} from ".";
import { MailFilterFormService } from "./MailFilterFormService";
import { FactoryService } from "../../../../modules/base-components/webapp/core/FactoryService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TableFactoryService } from "../../../base-components/webapp/core/table";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { ActionFactory } from "../../../../modules/base-components/webapp/core/ActionFactory";
import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextType } from "../../../../model/ContextType";
import { ContextMode } from "../../../../model/ContextMode";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";


export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'MailFilterUIModule';

    public async unRegister(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(MailFilterService.getInstance());
        ServiceRegistry.registerServiceInstance(MailFilterFormService.getInstance());
        FactoryService.getInstance().registerFactory(
            KIXObjectType.MAIL_FILTER, MailFilterBrowserFactory.getInstance()
        );
        TableFactoryService.getInstance().registerFactory(new MailFilterTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailFilterLabelProvider());
        TableFactoryService.getInstance().registerFactory(new MailFilterMatchTableFactory());
        TableFactoryService.getInstance().registerFactory(new MailFilterSetTableFactory());

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
