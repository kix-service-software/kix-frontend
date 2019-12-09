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

    public id = 'kix-chat-room';

    public initComponents: UIComponent[] = [
        new UIComponent(
            'kix-chat-room-component', '/kix-chat-room$0/webapp/core/ChatUIModule', []
        )
    ];

    public external: boolean = true;

    public uiComponents: UIComponent[] = [
        new UIComponent(
            'chat-room-module', '/kix-chat-room$0/webapp/components/chat-room-module', []
        ),
        new UIComponent(
            'chat-room-widget', '/kix-chat-room$0/webapp/components/chat-room-widget', []
        )
    ];

    public webDependencies: string[] = [
        './chat-room/webapp'
    ];

}

module.exports = (data, host, options) => {
    return new Extension();
};
