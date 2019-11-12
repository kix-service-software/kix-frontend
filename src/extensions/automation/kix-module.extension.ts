/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../core/extensions";
import { UIComponent } from "../../core/model/UIComponent";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { CRUD } from "../../core/model";

class Extension implements IKIXModuleExtension {

    public tags: Array<[string, string]>;

    public id = 'application-admin-module';

    public initComponents: UIComponent[] = [
        new UIComponent('job-module-component', 'core/browser/modules/ui-modules/JobsUIModule', [
            new UIComponentPermission('system/automation/jobs', [CRUD.CREATE], true),
            new UIComponentPermission('system/automation/jobs/*', [CRUD.UPDATE], true)
        ])
    ];

    public external: boolean = false;

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-notifications', 'notification/admin/notifications', []),
        new UIComponent('new-notification-dialog', 'notification/admin/dialogs/new-notification-dialog', []),
        new UIComponent('notification-input-events', 'notification/admin/dialogs/inputs/notification-input-events', []),
        new UIComponent(
            'notification-input-email-recipient',
            'notification/admin/dialogs/inputs/notification-input-email-recipient',
            []
        ),
        new UIComponent('notification-input-filter', 'notification/admin/dialogs/inputs/notification-input-filter', []),
        new UIComponent('notification-info-widget', 'notification/admin/widgets/notification-info-widget', []),
        new UIComponent('notification-label-widget', 'notification/admin/widgets/notification-label-widget', []),
        new UIComponent('notification-text-widget', 'notification/admin/widgets/notification-text-widget', []),
        new UIComponent(
            'notification-filter-cell-content', 'notification/admin/table/notification-filter-cell-content', []
        ),
        new UIComponent('edit-notification-dialog', 'notification/admin/dialogs/edit-notification-dialog', []),
        new UIComponent('admin-jobs', 'automation/admin/jobs', []),
        new UIComponent('new-job-dialog', 'automation/admin/dialogs/new-job-dialog', []),
        new UIComponent('job-input-events', 'automation/admin/dialogs/inputs/job-input-events', []),
        new UIComponent('job-input-filter', 'automation/admin/dialogs/inputs/job-input-filter', []
        ),
        new UIComponent('job-input-actions', 'automation/admin/dialogs/inputs/job-input-actions', []),
        new UIComponent('job-details-exec-plans-widget', 'automation/admin/widgets/job-details-exec-plans-widget', [])
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
