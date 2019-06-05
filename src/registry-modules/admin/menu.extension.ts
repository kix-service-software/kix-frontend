import { IMainMenuExtension } from '../../core/extensions';
import { AdminContext } from '../../core/browser/admin';
import {
    TicketTypeDetailsContext, TicketStateDetailsContext, TicketPriorityDetailsContext
} from '../../core/browser/ticket';
import { ConfigItemClassDetailsContext } from '../../core/browser/cmdb';
import { TranslationDetailsContext } from '../../core/browser/i18n/admin/context';
import { RoleDetailsContext, UserDetailsContext } from '../../core/browser/user';
import { QueueDetailsContext } from '../../core/browser/ticket/admin/context/ticket-queue';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { FAQCategoryDetailsContext } from '../../core/browser/faq/admin/context';
import { SystemAddressDetailsContext } from '../../core/browser/system-address';
import { MailAccountDetailsContext } from '../../core/browser/mail-account';
import { CRUD } from '../../core/model';

export class Extension implements IMainMenuExtension {

    public mainContextId: string = AdminContext.CONTEXT_ID;

    public contextIds: string[] = [
        AdminContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID,
        TranslationDetailsContext.CONTEXT_ID,
        TicketTypeDetailsContext.CONTEXT_ID,
        TicketPriorityDetailsContext.CONTEXT_ID,
        TicketStateDetailsContext.CONTEXT_ID,
        ConfigItemClassDetailsContext.CONTEXT_ID,
        RoleDetailsContext.CONTEXT_ID,
        UserDetailsContext.CONTEXT_ID,
        QueueDetailsContext.CONTEXT_ID,
        SystemAddressDetailsContext.CONTEXT_ID,
        FAQCategoryDetailsContext.CONTEXT_ID,
        MailAccountDetailsContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = false;

    public icon: string = "kix-icon-admin";

    public text: string = "Translatable#Admin";

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/classes', [CRUD.CREATE], true),
        new UIComponentPermission('cmdb/classes/*', [CRUD.UPDATE], true),
        new UIComponentPermission('faq/categories', [CRUD.CREATE], true),
        new UIComponentPermission('faq/categories/*', [CRUD.UPDATE], true),
        new UIComponentPermission('queues', [CRUD.CREATE], true),
        new UIComponentPermission('queues/*', [CRUD.UPDATE], true),
        new UIComponentPermission('tickettypes', [CRUD.CREATE], true),
        new UIComponentPermission('tickettypes/*', [CRUD.UPDATE], true),
        new UIComponentPermission('ticketstates', [CRUD.CREATE], true),
        new UIComponentPermission('ticketstates/*', [CRUD.UPDATE], true),
        new UIComponentPermission('priorities', [CRUD.CREATE], true),
        new UIComponentPermission('priorities/*', [CRUD.UPDATE], true),
        new UIComponentPermission('systemaddresses', [CRUD.CREATE], true),
        new UIComponentPermission('systemaddresses/*', [CRUD.UPDATE], true),
        new UIComponentPermission('mailaccounts', [CRUD.CREATE], true),
        new UIComponentPermission('mailaccounts/*', [CRUD.UPDATE], true),
        new UIComponentPermission('users', [CRUD.CREATE], true),
        new UIComponentPermission('users/*', [CRUD.UPDATE], true),
        new UIComponentPermission('roles', [CRUD.CREATE], true),
        new UIComponentPermission('roles/*', [CRUD.UPDATE], true),
        new UIComponentPermission('i18n/translations', [CRUD.CREATE], true),
        new UIComponentPermission('i18n/translations/*', [CRUD.UPDATE], true)
    ];
}

module.exports = (data, host, options) => {
    return new Extension();
};
