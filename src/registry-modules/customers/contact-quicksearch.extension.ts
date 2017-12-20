import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { IContactService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { ContactQuickSearch } from './ContactQuickSearch';

export class CustomerUserQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'contact';

    public getQuickSearch(): IQuickSearch {
        return new ContactQuickSearch(this.id, 'Ansprechpartner', 'kix-icon-dropdown-customer-user');
    }

    public execute(token: string, searchValue: string): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            const contactService = container.getDIContainer().get<IContactService>("IContactService");

            if (contactService) {
                searchValue = '*' + searchValue + '*';
                const contacts = await contactService.getContacts(token, 15, null, null, {
                    fields: "Contact.ContactID,Contact.UserEmail,Contact.UserFirstname,Contact.UserLastname",
                    filter: {
                        Contact: {
                            OR: [
                                { Field: "UserLogin", Operator: "LIKE", Value: searchValue },
                                { Field: "UserCustomerID", Operator: "LIKE", Value: searchValue },
                                { Field: "UserLastname", Operator: "LIKE", Value: searchValue },
                                { Field: "UserFirstname", Operator: "LIKE", Value: searchValue },
                                { Field: "UserEmail", Operator: "LIKE", Value: searchValue }
                            ]
                        }
                    }
                });
                resolve(contacts);
            } else {
                reject('ContactService not available!');
            }
        });
    }
}

module.exports = (data, host, options) => {
    return new CustomerUserQuickSearchExtension();
};
