/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    public id = 'kix-module-table';

    public external: boolean = false;

    public initComponents: UIComponent[] = [
        new UIComponent('TableUIModule', '/kix-module-table$0/webapp/core/TableUIModule', []),
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('kix-table', '/kix-module-table$0/webapp/components/kix-table', []),
        new UIComponent(
            'table-configuration',
            '/kix-module-table$0/webapp/components/ui-configuration/table-configuration',
            []
        ),
        new UIComponent(
            'crud-cell',
            '/kix-module-table$0/webapp/components' +
            '/kix-table/table-body/table-row/table-cell/crud-cell',
            []
        ),
        new UIComponent(
            'default-cell-content',
            '/kix-module-table$0/webapp/components' +
            '/kix-table/table-body/table-row/table-cell/default-cell-content',
            []
        ),
        new UIComponent(
            'label-list-cell-content',
            '/kix-module-table$0/webapp/components' +
            '/kix-table/table-body/table-row/table-cell/label-list-cell-content',
            []
        ),
        new UIComponent(
            'multiline-cell',
            '/kix-module-table$0/webapp/components' +
            '/kix-table/table-body/table-row/table-cell/multiline-cell',
            []
        ),
        new UIComponent('table-widget', '/kix-module-table$0/webapp/components/table-widget', []),
        new UIComponent(
            'table-widget-configuration',
            '/kix-module-table$0/webapp/components/ui-configuration/table-widget-configuration',
            []
        )
    ];

    public webDependencies: string[] = [
        './table/webapp'
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
