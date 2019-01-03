import { Customer } from './Customer';
import { CustomerSource } from './CustomerSource';

export class CustomerFactory {

    public static create(customer: Customer, customerSource?: CustomerSource): Customer {
        const newCustomer = new Customer(customer);

        if (customerSource) {
            this.mapCustomerSource(newCustomer, customerSource);
        }

        return newCustomer;
    }

    private static mapCustomerSource(customer: Customer, source: CustomerSource): void {
        customer.customerSourceMap = [];
        const unknownGroupAttributes: Array<[string, string]> = [];
        source.AttributeMapping.forEach((am) => {
            if (am.DisplayGroup) {
                const group = customer.customerSourceMap.find((csm) => csm[0] === am.DisplayGroup);
                if (!group) {
                    customer.customerSourceMap.push([am.DisplayGroup, [[am.Label, am.Attribute]]]);
                } else {
                    group[1].push([am.Label, am.Attribute]);
                }
            } else {
                unknownGroupAttributes.push([am.Label, am.Attribute]);
            }
        });

        if (unknownGroupAttributes.length > 0) {
            customer.customerSourceMap.push(['UNKNOWN', unknownGroupAttributes]);
        }
    }

}
