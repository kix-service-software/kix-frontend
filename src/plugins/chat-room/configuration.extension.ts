/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    IConfigurationExtension
} from "../../frontend-applications/agent-portal/server/extensions/IConfigurationExtension";
import { IConfiguration } from "../../frontend-applications/agent-portal/model/configuration/IConfiguration";
import { WidgetConfiguration } from "../../frontend-applications/agent-portal/model/configuration/WidgetConfiguration";
import { ConfigurationType } from "../../frontend-applications/agent-portal/model/configuration/ConfigurationType";
import {
    ContextConfiguration
} from "../../frontend-applications/agent-portal/model/configuration/ContextConfiguration";
import { ConfiguredWidget } from "../../frontend-applications/agent-portal/model/configuration/ConfiguredWidget";
import { ChatRoomContext } from "./webapp/core";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return ChatRoomContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        configurations.push(
            new WidgetConfiguration(
                'chat-room-main-widget', 'chat-room Widget', ConfigurationType.Widget,
                'chat-room-widget', 'My chat-room Widget', [], null
            )
        );

        configurations.push(new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(),
            [],
            [], [],
            [
                new ConfiguredWidget('chat-room-main-widget', 'chat-room-main-widget')
            ], [],
        ));

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
