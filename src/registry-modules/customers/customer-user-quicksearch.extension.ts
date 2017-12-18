import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { ITicketService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { CustomerUserQuickSearch } from './CustomerUserQuickSearch';

export class CustomerUserQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'customer-user';

    public getQuickSearch(): IQuickSearch {
        return new CustomerUserQuickSearch(this.id, 'Ansprechpartner', 'kix-icon-dropdown-customer-user');
    }

    public execute(token: string, searchValue: string): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            resolve([]);
        });
    }
}

module.exports = (data, host, options) => {
    return new CustomerUserQuickSearchExtension();
};
