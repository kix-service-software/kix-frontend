import { ContactDetailsContextConfiguration } from ".";
import {
    ConfiguredWidget, Context, WidgetType,
    WidgetConfiguration, Contact, KIXObjectType, BreadcrumbInformation,
    KIXObject, KIXObjectCache, KIXObjectLoadingOptions
} from "../../../model";
import { ContactService } from "../ContactService";
import { CustomerContext } from "../../customer";
import { KIXObjectService } from "../../kix";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";

export class ContactDetailsContext extends Context<ContactDetailsContextConfiguration> {

    public static CONTEXT_ID: string = 'contact-details';

    public getIcon(): string {
        return 'kix-icon-man-bubble';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return LabelService.getInstance().getText(await this.getObject<Contact>(), short, short);
    }

    public navigateTo(objectId: string): void {
        ContactService.getInstance().openContact(objectId);
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

    protected getSpecificWidgetConfiguration<WS = any>(instanceId: string): WidgetConfiguration<WS> {
        let configuration: WidgetConfiguration<WS>;

        const laneWidget = this.configuration.laneWidgets.find((lw) => lw.instanceId === instanceId);
        configuration = laneWidget ? laneWidget.configuration : undefined;

        if (!configuration) {
            const laneTabWidget = this.configuration.laneTabWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = laneTabWidget ? laneTabWidget.configuration : undefined;
        }

        if (!configuration) {
            const groupWidget = this.configuration.groupWidgets.find((ltw) => ltw.instanceId === instanceId);
            configuration = groupWidget ? groupWidget.configuration : undefined;
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

        if (!widgetType) {
            const groupWidget = this.configuration.groupWidgets.find((ltw) => ltw.instanceId === instanceId);
            widgetType = groupWidget ? WidgetType.GROUP : undefined;
        }

        return widgetType;
    }

    public getBreadcrumbInformation(): BreadcrumbInformation {
        return new BreadcrumbInformation('kix-icon-customers', [CustomerContext.CONTEXT_ID]);
    }

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.CONTACT, reload: boolean = false
    ): Promise<O> {
        let object;

        if (!KIXObjectCache.isObjectCached(KIXObjectType.CONTACT, this.objectId)) {
            object = await this.loadContact();
        } else {
            object = KIXObjectCache.getObject(KIXObjectType.CONTACT, this.objectId);
        }

        return object;
    }

    private async loadContact(): Promise<Contact> {
        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish('APP_LOADING', { loading: true, hint: 'Lade Ansprechpartner ...' });
        }, 500);

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['TicketStats', 'Tickets']);

        const contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, [this.objectId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let contact;
        if (contacts && contacts.length) {
            contact = contacts[0];
            this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), contact, KIXObjectType.CONTACT));
        }

        EventService.getInstance().publish('APP_LOADING', { loading: false });
        return contact;
    }

}
