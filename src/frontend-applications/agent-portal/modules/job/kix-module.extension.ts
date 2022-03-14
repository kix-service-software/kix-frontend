/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'job-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('job-component', '/kix-module-job$0/webapp/core/JobUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('admin-jobs', '/kix-module-job$0/webapp/components/admin-jobs', []),
        new UIComponent(
            'job-details-exec-plans-widget', '/kix-module-job$0/webapp/components/job-details-exec-plans-widget', []
        ),
        new UIComponent(
            'job-details-filter-widget',
            '/kix-module-job$0/webapp/components/job-details-filter-widget', []
        ),
        new UIComponent('job-input-events', '/kix-module-job$0/webapp/components/job-input-events', []),
        new UIComponent(
            'job-input-fetchAssetAttributesMapping',
            '/kix-module-job$0/webapp/components/job-input-fetchAssetAttributesMapping', []
        ),
        new UIComponent('job-input-filter', '/kix-module-job$0/webapp/components/job-input-filter', []),
        new UIComponent(
            'job-input-ticketCreateDynamicField',
            '/kix-module-job$0/webapp/components/job-input-ticketCreateDynamicField', []
        ),
        new UIComponent('new-job-dialog', '/kix-module-job$0/webapp/components/new-job-dialog', []),
        new UIComponent('edit-job-dialog', '/kix-module-job$0/webapp/components/edit-job-dialog', []),
        new UIComponent('job-run-history-widget', '/kix-module-job$0/webapp/components/job-run-history-widget', []),
        new UIComponent(
            'job-run-log-download-cell', '/kix-module-job$0/webapp/components/job-run-log-download-cell', []
        ),
        new UIComponent('job-run-logs', '/kix-module-job$0/webapp/components/job-run-logs', []),
        new UIComponent(
            'job-filter-cell-content',
            '/kix-module-job$0/webapp/components/job-filter-cell-content', []
        ),
        new UIComponent('macro-action-details', '/kix-module-job$0/webapp/components/macro-action-details', [])
    ];

    public webDependencies: string[] = [
        './job/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
