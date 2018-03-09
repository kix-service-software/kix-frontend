import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { ICustomerService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { CustomerQuickSearch } from './CustomerQuickSearch';

export class CustomerQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'customer';

    public getQuickSearch(): IQuickSearch {
        return new CustomerQuickSearch(
            this.id, 'Kunde', 'kix-icon-dropdown-customer', 'customers', 'CustomerID', ['CustomerCompanyName']
        );
    }

    public execute(token: string, searchValue: string): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            resolve([]);
        });
    }
}

module.exports = (data, host, options) => {
    return new CustomerQuickSearchExtension();
};
