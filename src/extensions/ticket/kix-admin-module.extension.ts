import { IKIXModuleExtension } from '../../core/extensions';
import { UIComponent } from '../../core/model/UIComponent';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';
import { CRUD } from '../../core/model';

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'ticket-admin-module';

    public initComponents: UIComponent[] = [
        new UIComponent('ticket-admin-module-component', 'ticket/module/ticket-admin-module-component',
            [
                new UIComponentPermission('system/ticket/queues', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/queues/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/types', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/types/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/states', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/states/*', [CRUD.UPDATE], true),
                new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE], true),
                new UIComponentPermission('system/ticket/priorities/*', [CRUD.UPDATE], true)
            ]
        )
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('ticket-admin-types', 'ticket/admin/ticket-admin-types', []),
        new UIComponent('ticket-type-info-widget', 'ticket/admin/widgets/ticket-type-info-widget', []),
        new UIComponent(
            'ticket-type-assigned-textmodules', 'ticket/admin/widgets/ticket-type-assigned-textmodules', []
        ),
        new UIComponent('new-ticket-type-dialog', 'ticket/admin/dialogs/new-ticket-type-dialog', []),
        new UIComponent('edit-ticket-type-dialog', 'ticket/admin/dialogs/edit-ticket-type-dialog', []),
        new UIComponent('ticket-admin-states', 'ticket/admin/ticket-admin-states', []),
        new UIComponent('ticket-state-info-widget', 'ticket/admin/widgets/ticket-state-info-widget', []),
        new UIComponent(
            'ticket-state-assigned-textmodules', 'ticket/admin/widgets/ticket-state-assigned-textmodules', []
        ),
        new UIComponent('new-ticket-state-dialog', 'ticket/admin/dialogs/new-ticket-state-dialog', []),
        new UIComponent('edit-ticket-state-dialog', 'ticket/admin/dialogs/edit-ticket-state-dialog', []),
        new UIComponent('ticket-admin-priorities', 'ticket/admin/ticket-admin-priorities', []),
        new UIComponent('ticket-priority-info-widget', 'ticket/admin/widgets/ticket-priority-info-widget', []),
        new UIComponent('new-ticket-priority-dialog', 'ticket/admin/dialogs/new-ticket-priority-dialog', []),
        new UIComponent('edit-ticket-priority-dialog', 'ticket/admin/dialogs/edit-ticket-priority-dialog', []),
        new UIComponent('ticket-admin-queues', 'ticket/admin/ticket-admin-queues', []),
        new UIComponent('new-ticket-queue-dialog', 'ticket/admin/dialogs/new-ticket-queue-dialog', []),
        new UIComponent('edit-ticket-queue-dialog', 'ticket/admin/dialogs/edit-ticket-queue-dialog', []),
        new UIComponent('queue-input-follow-up', 'ticket/admin/dialogs/inputs/queue-input-follow-up', []),
        new UIComponent('ticket-queue-info-widget', 'ticket/admin/widgets/ticket-queue-info-widget', []),
        new UIComponent('ticket-queue-signature', 'ticket/admin/widgets/ticket-queue-signature', []),
        new UIComponent('ticket-admin-templates', 'ticket/admin/ticket-admin-templates', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
