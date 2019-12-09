/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from "../../frontend-applications/agent-portal/model/IKIXModuleExtension";
import { UIComponent } from "../../frontend-applications/agent-portal/model/UIComponent";

class Extension implements IKIXModuleExtension {

    public applications: string[] = ['agent-portal'];

    public tags: Array<[string, string]>;

    public id = 'kix-json-schema-editor';

    public initComponents: UIComponent[] = [
        new UIComponent(
            'kix-json-schema-editor-component', '/kix-json-schema-editor$0/webapp/core/JSONSchemaUIModule', []
        )
    ];

    public external: boolean = true;

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'json-schema-editor-module', '/kix-json-schema-editor$0/webapp/components/json-schema-editor-module', []
        ),
        new UIComponent(
            'json-schema-editor-widget', '/kix-json-schema-editor$0/webapp/components/json-schema-editor-widget', []
        )
    ];

    public webDependencies: string[] = [
        './json-schema-editor/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
