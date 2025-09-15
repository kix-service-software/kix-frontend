/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

    public id = 'kix-module-tiptap';

    public applications: string[] = ['agent-portal', 'SSP'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './tiptap/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-tiptap$0/webapp/core/TiptapEditorUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('tiptap-editor', '/kix-module-tiptap$0/webapp/components/tiptap-editor', []),
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};