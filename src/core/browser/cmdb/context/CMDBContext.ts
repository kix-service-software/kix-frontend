import {
    Context, ConfiguredWidget, WidgetType, WidgetConfiguration, ConfigItemClass, KIXObjectType, KIXObjectLoadingOptions,
    FilterCriteria, ConfigItemProperty, FilterDataType, FilterType, VersionProperty
} from "../../../model";
import { CMDBContextConfiguration } from "./CMDBContextConfiguration";
import { ServiceRegistry, KIXObjectService } from "../../kix";
import { SearchOperator } from "../../SearchOperator";
import { CMDBService } from "../CMDBService";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";

export class CMDBContext extends Context<CMDBContextConfiguration> {

    public static CONTEXT_ID: string = 'cmdb';

    public currentCIClass: ConfigItemClass;

    public getIcon(): string {
        return 'kix-icon-cmdb';
    }

    public async getDisplayText(): Promise<string> {
        return 'CMDB Dashboard';
    }

    public getContent(show: boolean = false): ConfiguredWidget[] {
        let content = this.configuration.contentWidgets;

        if (show) {
            content = content.filter(
                (c) => this.configuration.content.findIndex((cid) => c.instanceId === cid) !== -1
            );
        }

        return content;
    }

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        const widget = this.configuration.contentWidgets.find((cw) => cw.instanceId === instanceId);
        return widget ? widget.configuration : undefined;
    }

    protected getSpecificWidgetType(instanceId: string): WidgetType {
        let widgetType: WidgetType;

        const contentWidget = this.configuration.contentWidgets.find((lw) => lw.instanceId === instanceId);
        widgetType = contentWidget ? WidgetType.CONTENT : undefined;

        return widgetType;
    }

    public async setCIClass(ciClass: ConfigItemClass): Promise<void> {
        this.currentCIClass = ciClass;
        await this.loadConfigItems();
    }

    public async loadConfigItems(): Promise<void> {
        const deploymentIds = await this.getDeploymentStateIds();

        const filterCriteria = [
            new FilterCriteria(
                ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, deploymentIds
            )
        ];

        if (this.currentCIClass) {
            filterCriteria.push(new FilterCriteria(
                ConfigItemProperty.CLASS_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.currentCIClass.ID
            ));
        }

        const loadingOptions = new KIXObjectLoadingOptions(
            null, filterCriteria, null, null, null, [VersionProperty.DATA, VersionProperty.PREPARED_DATA]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Lade Config Items ...`
            });
        }, 500);

        const configItems = await KIXObjectService.loadObjects(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(configItems);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    private async getDeploymentStateIds(): Promise<number[]> {
        const service = ServiceRegistry.getServiceInstance<CMDBService>(
            KIXObjectType.CONFIG_ITEM
        );
        const catalogItems = await service.getDeploymentStates();
        return catalogItems.map((c) => c.ItemID);
    }

}
