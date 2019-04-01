import {
    Context, ConfiguredWidget, Role, WidgetConfiguration, WidgetType,
    BreadcrumbInformation, KIXObject, KIXObjectType, KIXObjectLoadingOptions, RoleProperty
} from "../../../../model";
import { RoleDetailsContextConfiguration } from "./RoleDetailsContextConfiguration";
import { LabelService } from "../../../LabelService";
import { AdminContext } from "../../../admin";
import { EventService } from "../../../event";
import { ApplicationEvent } from "../../../application";
import { KIXObjectService } from "../../../kix";
import { TranslationService } from "../../../i18n/TranslationService";


export class RoleDetailsContext extends Context<RoleDetailsContextConfiguration> {

    public static CONTEXT_ID = 'user-role-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<Role>(), true, !short);
    }

    public getLanes(show: boolean = false): ConfiguredWidget[] {
        let lanes = this.configuration.laneWidgets;

        if (show) {
            lanes = lanes.filter(
                (l) => this.configuration.lanes.findIndex((lid) => l.instanceId === lid) !== -1
            );
        }

        return lanes;
    }

    public getLaneTabs(show: boolean = false): ConfiguredWidget[] {
        let laneTabs = this.configuration.laneTabWidgets;

        if (show) {
            laneTabs = laneTabs.filter(
                (lt) => this.configuration.sidebars.findIndex((ltId) => lt.instanceId === ltId) !== -1
            );
        }

        return laneTabs;
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

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Role');
        const object = await this.getObject<Role>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${object.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.ROLE, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadRole(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.ROLE, changedProperties)
            );
        }

        return object;
    }

    private async loadRole(changedProperties: string[] = [], cache: boolean = true): Promise<Role> {
        const roleId = Number(this.objectId);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [RoleProperty.USER_IDS, RoleProperty.PERMISSIONS]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Role ...`
            });
        }, 500);

        const roles = await KIXObjectService.loadObjects<Role>(
            KIXObjectType.ROLE, [roleId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let role: Role;
        if (roles && roles.length) {
            role = roles[0];
            this.objectId = role.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return role;
    }

}
