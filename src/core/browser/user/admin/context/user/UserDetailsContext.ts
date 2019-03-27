import { UserDetailsContextConfiguration } from "./UserDetailsContextConfiguration";
import {
    Context, User, ConfiguredWidget, WidgetConfiguration, WidgetType, BreadcrumbInformation,
    KIXObjectType, KIXObject, KIXObjectLoadingOptions, UserProperty
} from "../../../../../model";
import { LabelService } from "../../../../LabelService";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { ApplicationEvent } from "../../../../application";
import { KIXObjectService } from "../../../../kix";
import { TranslationService } from "../../../../i18n/TranslationService";

export class UserDetailsContext extends Context<UserDetailsContextConfiguration> {

    public static CONTEXT_ID = 'user-details';

    public getIcon(): string {
        return 'kix-icon-gear';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<User>(), true, !short);
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
        const objectName = await TranslationService.translate('Translatable#Agent');
        const object = await this.getObject<User>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${text}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.USER, reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const user = await this.loadUser(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), user, KIXObjectType.USER, changedProperties)
            );
        }

        return user;
    }

    private async loadUser(changedProperties: string[] = [], cache: boolean = true): Promise<User> {
        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load User ...' }
        );

        const userId = Number(this.objectId);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [UserProperty.PREFERENCES, UserProperty.ROLEIDS]
        );

        const users = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [userId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        let user: User;
        if (users && users.length) {
            user = users[0];
            this.objectId = user.UserID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return user;
    }

}
