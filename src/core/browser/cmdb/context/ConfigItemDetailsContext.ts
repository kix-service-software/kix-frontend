import { ConfigItemDetailsContextConfiguration } from "./ConfigItemDetailsContextConfiguration";
import {
    Context, ConfigItem, KIXObjectType, WidgetConfiguration,
    WidgetType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions,
    ConfiguredWidget, VersionProperty, KIXObjectCache
} from "../../../model";
import { KIXObjectService } from "../../kix";
import { CMDBContext } from "./CMDBContext";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";

export class ConfigItemDetailsContext extends Context<ConfigItemDetailsContextConfiguration> {

    public static CONTEXT_ID = 'config-item-details';

    public getIcon(): string {
        return 'kix-icon-ci';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<ConfigItem>(), true, !short);
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show && laneTabs) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.laneTabs.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
    }

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show && lanes) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show && content) {
            content = content.filter(
                (l) => this.configuration.content.findIndex((cid) => l.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        configuration = laneWidget ? laneWidget.configuration : undefined;

        if (!configuration) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
        }

        if (!configuration) {
            const contentWidget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
            configuration = contentWidget ? contentWidget.configuration : undefined;
        }

        return configuration;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = laneWidget ? WidgetType.LANE : undefined;

        if (!widgetType) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            widgetType = laneTabWidget ? WidgetType.LANE_TAB : undefined;
        }

        return widgetType;
    }

    public getBreadcrumbInformation(): BreadcrumbInformation {
        return new BreadcrumbInformation(this.getIcon(), [CMDBContext.CONTEXT_ID]);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM, reload: boolean = false
    ): Promise<O> {
        let object;

        if (!objectType) {
            objectType = KIXObjectType.CONFIG_ITEM;
        }

        if (!KIXObjectCache.isObjectCached(KIXObjectType.CONFIG_ITEM, Number(this.objectId))) {
            object = await this.loadConfigItem();
            reload = true;
        } else {
            object = KIXObjectCache.getObject(KIXObjectType.CONFIG_ITEM, Number(this.objectId));
        }

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.CONFIG_ITEM)
            );
        }

        return object;
    }

    private async loadConfigItem(): Promise<ConfigItem> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Lade Config Item ...' }
        );

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null,
            ['Versions', 'Links', 'History', VersionProperty.DATA, VersionProperty.PREPARED_DATA],
            ['Links']
        );

        const itemId = Number(this.objectId);

        const configItems = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, [itemId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let configItem;
        if (configItems && configItems.length) {
            configItem = configItems[0];
        }

        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: false, hint: 'Lade Config Item ...' }
        );
        return configItem;
    }

}
