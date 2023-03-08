/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'reporting-module';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent(
            'reporting-module-component', '/kix-module-reporting$0/webapp/core/ReportingUIModule',
            [
                new UIComponentPermission('reporting/reportdefinitions', [CRUD.READ], true),
            ]
        )
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('reporting-module', '/kix-module-reporting$0/webapp/components/reporting-module', []),
        new UIComponent('reportdefinition-list-widget', '/kix-module-reporting$0/webapp/components/reportdefinition-list-widget', []),
        new UIComponent('report-list-widget', '/kix-module-reporting$0/webapp/components/report-list-widget', []),
        new UIComponent(
            'reportresult-list-cell', '/kix-module-reporting$0/webapp/components/reportresult-list-cell', []
        ),
        new UIComponent(
            'reportdefinition-outputformat-list-cell', '/kix-module-reporting$0/webapp/components/reportdefinition-outputformat-list-cell', []
        ),
        new UIComponent(
            'create-new-report-cell', '/kix-module-reporting$0/webapp/components/create-new-report-cell', []
        ),
        new UIComponent('output-format-info', '/kix-module-reporting$0/webapp/components/output-format-info', [])
    ];

    public webDependencies: string[] = [
        './reporting/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
