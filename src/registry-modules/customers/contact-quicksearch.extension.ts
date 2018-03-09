import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { IContactService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { ContactQuickSearch } from './ContactQuickSearch';

export class CustomerUserQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'contact';

    public getQuickSearch(): IQuickSearch {
        return new ContactQuickSearch(
            this.id, 'Ansprechpartner', 'kix-icon-dropdown-customer-user', 'customers',
            'ContactID', ['UserFirstname', 'UserLastname', 'UserEmail']
        );
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
