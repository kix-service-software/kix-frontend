import { Customer, KIXObjectType } from "../../../core/model";
import { KIXObjectService } from "../../../core/browser";
import { ComponentState } from './ComponentState';

class CustomerInfoComponent {

    private state: ComponentState;

    private customerId: string = null;
    private groups: string[] = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.customerId !== input.customerId) {
            this.customerId = input.customerId;
            this.groups = input.groups;
            this.loadCustomer();
        }
    }

    public onMount(): void {
        this.loadCustomer();
    }

    private async loadCustomer(): Promise<void> {
        this.state.error = null;
        this.state.customer = null;

        if (this.customerId) {
            const customers = await KIXObjectService.loadObjects<Customer>(KIXObjectType.CUSTOMER, [this.customerId])
                .catch((error) => {
                    this.state.error = error;
                });

            if (customers && customers.length) {
                let info = this.state.customer.getCustomerInfoData();
                if (this.groups && this.groups.length) {
                    info = this.state.info.filter(
                        (g) => this.groups.some((group) => group === g[0])
                    );
                }
                this.state.customer = customers[0];
                this.state.info = info;
            }
        }
    }

}

module.exports = CustomerInfoComponent;
