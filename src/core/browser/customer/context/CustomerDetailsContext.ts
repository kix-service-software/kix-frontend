import {
    Context, Customer, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions
} from '../../../model';
import { CustomerContext } from './CustomerContext';
import { KIXObjectService } from '../../kix';
import { EventService } from '../../event';
import { LabelService } from '../../LabelService';
import { ApplicationEvent } from '../../application';

export class CustomerDetailsContext extends Context {

    public static CONTEXT_ID: string = 'customer-details';

    public getIcon(): string {
        return 'kix-icon-man-house';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return LabelService.getInstance().getText(await this.getObject<Customer>(), short, short);
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
