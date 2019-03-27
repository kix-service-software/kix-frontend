import { CustomerDetailsContextConfiguration } from '.';
import {
    ConfiguredWidget, Context, WidgetType, WidgetConfiguration,
    Customer, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions
} from '../../../model';
import { CustomerService } from '../CustomerService';
import { CustomerContext } from './CustomerContext';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { LabelService } from '../../LabelService';
import { ApplicationEvent } from '../../application';

export class CustomerDetailsContext extends Context<CustomerDetailsContextConfiguration> {

    public static CONTEXT_ID: string = 'customer-details';

    public getIcon(): string {
        return 'kix-icon-man-house';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return LabelService.getInstance().getText(await this.getObject<Customer>(), short, short);
    }

    public navigateTo(objectId: string): void {
        CustomerService.getInstance().openCustomer(objectId);
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

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<Customer>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation('kix-icon-customers', [CustomerContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CUSTOMER, reload: boolean = false
    ): Promise<O> {
        const object = await this.loadCustomer() as any;

        if (reload) {
            this.listeners.forEach((l) => l.objectChanged(this.getObjectId(), object, KIXObjectType.CUSTOMER));
        }

        return object;
    }

    private async loadCustomer(): Promise<Customer> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, ['Contacts', 'Tickets', 'TicketStats']
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Load Customer ...' }
            );
        }, 500);

        const customers = await KIXObjectService.loadObjects<Customer>(
            KIXObjectType.CUSTOMER, [this.objectId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let customer;
        if (customers && customers.length) {
            customer = customers[0];
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });

        return customer;
    }
}
