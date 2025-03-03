/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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

    public id = 'kix-module-ck-editor';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './ck-editor/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-ck-editor$0/webapp/core/CKEditorUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('editor', '/kix-module-ck-editor$0/webapp/components/editor', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};