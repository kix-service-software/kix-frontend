import { IQuickSearchExtension } from '@kix/core/dist/extensions';
import { Ticket, TicketProperty, IQuickSearch } from '@kix/core/dist/model/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { ITicketService } from '@kix/core/dist/services';
import { container } from '../../Container';
import { TicketQuickSearch } from './TicketQuickSearch';

export class TicketQuickSearchExtension implements IQuickSearchExtension<Ticket> {

    public id: string = 'ticket';

    public getQuickSearch(): IQuickSearch {
        return new TicketQuickSearch(this.id, 'Ticket', 'kix-icon-dropdown-ticket', 'tickets', 'TicketID', ['Title']);
    }

    public execute(token: string, searchValue: string): Promise<Ticket[]> {
        return new Promise(async (resolve, reject) => {
            const properties = [
                TicketProperty.TICKET_ID,
                TicketProperty.TITLE
            ];

            const value = '*' + searchValue + '*';

            const filter: Array<[TicketProperty, SearchOperator, string | number | string[] | number[]]> = [
                [TicketProperty.TICKET_NUMBER, SearchOperator.LIKE, value],
                [TicketProperty.TITLE, SearchOperator.LIKE, value],
                [TicketProperty.BODY, SearchOperator.LIKE, value],
                [TicketProperty.FROM, SearchOperator.LIKE, value],
                [TicketProperty.TO, SearchOperator.LIKE, value],
                [TicketProperty.CC, SearchOperator.LIKE, value]
            ];

            const ticketService = container.getDIContainer().get<ITicketService>("ITicketService");

            if (ticketService) {
                const tickets = await ticketService.getTickets(token, properties, 15, filter, true)
                    .catch((error) => {
                        reject(error.errorMessage.body);
                    });

                resolve((tickets as Ticket[]));
            } else {
                reject("Ticketservice not available!");
            }
        });
    }
}

module.exports = (data, host, options) => {
    return new TicketQuickSearchExtension();
};
