/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { ConfigItemLabelProvider } from "../../core";
import { IdService } from "../../../../../model/IdService";
import { ConfigItemProperty } from "../../../model/ConfigItemProperty";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { ConfigItem } from "../../../model/ConfigItem";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ActionFactory } from "../../../../../modules/base-components/webapp/core/ActionFactory";
import { ObjectIcon } from "../../../../icon/model/ObjectIcon";
import { Context } from "../../../../../model/Context";

class Component {

    private state: ComponentState;
    private contextListenerId: string = null;

    public labelProvider: ConfigItemLabelProvider = new ConfigItemLabelProvider();
    public properties;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('config-item-info-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new ConfigItemLabelProvider();
        this.properties = ConfigItemProperty;

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, configItem: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, configItem);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<ConfigItem>());
    }

    private async initWidget(context: Context, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;

        this.state.configItem = configItem ? configItem : await context.getObject<ConfigItem>();
        await this.prepareActions();

        setTimeout(() => {
            this.state.loading = false;
        }, 50);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.configItem]
            );
        }
    }

    public getIcon(object: string, objectId: string): ObjectIcon {
        return new ObjectIcon(object, objectId);
    }
}

module.exports = Component;
