/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import {
    MailAccountFormService, MailAccountTableFactory, MailAccountLabelProvider,
    MailAccountCreateAction, NewMailAccountDialogContext, MailAccountEditAction, MailAccountFetchAction,
    MailAccountTableDeleteAction, EditMailAccountDialogContext, MailAccountDetailsContext
} from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { MailAccountService } from './MailAccountService';
import { SetupService } from '../../../setup-assistant/webapp/core/SetupService';
import { SetupStep } from '../../../setup-assistant/webapp/core/SetupStep';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'MailAccountUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(MailAccountService.getInstance());
        ServiceRegistry.registerServiceInstance(MailAccountFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
        LabelService.getInstance().registerLabelProvider(new MailAccountLabelProvider());

        ActionFactory.getInstance().registerAction('mail-account-create', MailAccountCreateAction);

        const newMailAccountDialogContext = new ContextDescriptor(
            NewMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['mail-accounts'], NewMailAccountDialogContext,
            [
                new UIComponentPermission('system/communication/mailaccounts', [CRUD.CREATE])
            ],
            'Translatable#New Mail Account', 'kix-icon-mail', MailAccountDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(newMailAccountDialogContext);

        ActionFactory.getInstance().registerAction('mail-account-edit', MailAccountEditAction);
        ActionFactory.getInstance().registerAction('mail-account-fetch', MailAccountFetchAction);
        ActionFactory.getInstance().registerAction('mail-account-table-delete', MailAccountTableDeleteAction);

        const editMailAccountDialogContext = new ContextDescriptor(
            EditMailAccountDialogContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['mail-accounts'], EditMailAccountDialogContext,
            [
                new UIComponentPermission('system/communication/mailaccounts', [CRUD.CREATE])
            ],
            'Translatable#Edit Mail Account', 'kix-icon-mail', MailAccountDetailsContext.CONTEXT_ID
        );
        ContextService.getInstance().registerContext(editMailAccountDialogContext);

        const mailAccountDetailsContext = new ContextDescriptor(
            MailAccountDetailsContext.CONTEXT_ID, [KIXObjectType.MAIL_ACCOUNT],
            ContextType.MAIN, ContextMode.DETAILS,
            false, 'object-details-page', ['mail-accounts'], MailAccountDetailsContext,
            [
                new UIComponentPermission('system/communication/mailaccounts', [CRUD.READ])
            ],
            'Translatable#Mail Account Details', 'kix-icon-mail'
        );
        ContextService.getInstance().registerContext(mailAccountDetailsContext);

        SetupService.getInstance().registerSetupStep(
            new SetupStep('setup-sending-email', 'Translatable#Outbox', 'setup-sending-email',
                [
                    new UIComponentPermission('system/config', [CRUD.READ])
                ],
                'Translatable#Setup email server', 'Translatable#setup_assistant_sending_email_text',
                'kix-icon-mail-forward-outline', 40
            )
        );

        SetupService.getInstance().registerSetupStep(
            new SetupStep(
                'MailAccount', 'Translatable#Inbox', 'setup-mail-account',
                [
                    new UIComponentPermission('/system/communication/mailaccounts', [CRUD.CREATE])
                ],
                'Translatable#Add email account for incoming mails', 'Translatable#setup_assistant_add_mail_account_text',
                'kix-icon-mail-answer-outline', 30
            )
        );
    }
}
