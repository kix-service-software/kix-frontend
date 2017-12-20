import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { ICustomerService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { CustomerQuickSearch } from './CustomerQuickSearch';

export class CustomerQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'customer';

    public getQuickSearch(): IQuickSearch {
        return new CustomerQuickSearch(this.id, 'Kunde', 'kix-icon-dropdown-customer');
    }

    public execute(token: string, searchValue: string): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            const contactService = container.getDIContainer().get<ICustomerService>("ICustomerService");

            if (contactService) {
                searchValue = '*' + searchValue + '*';
                const contacts = await contactService.getCustomers(token, 15, null, null, {
                    fields: "Customer.CustomerID,Customer.CustomerCompanyName",
                    filter: {
                        Customer: {
                            OR: [
                                { Field: "CustomerCompanyName", Operator: "LIKE", Value: searchValue }
                            ]
                        }
                    }
                });

                resolve(contacts);
            } else {
                reject("CustomerService not available!");
            }
        });
    }
}

module.exports = (data, host, options) => {
    return new CustomerQuickSearchExtension();
};
