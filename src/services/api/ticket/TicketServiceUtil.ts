import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { TicketProperty } from '@kix/core/dist/model/';

export class TicketServiceUtil {
    public static getTicketProperties(properties: string[]): string[] {
        const ticketProperties = [];
        if (properties) {
            for (let property of properties) {
                if (!property.startsWith("Ticket.")) {
                    property = "Ticket." + property;
                }
                ticketProperties.push(property);
            }
        }
        return ticketProperties;
    }

    public static prepareTicketFilter(
        ticketFilter: Array<[TicketProperty, SearchOperator, string | number | string[] | number[]]>,
        OR_SEARCH
    ): string {
        let filter = "";
        if (ticketFilter && ticketFilter.length) {
            const filterObject = {
                Ticket: TicketServiceUtil.prepareFilterOperations(ticketFilter, OR_SEARCH)
            };

            filter = JSON.stringify(filterObject);
        }
        return filter;
    }

    public static prepareFilterOperations(
        ticketFilter: Array<[TicketProperty, SearchOperator, string | number | string[] | number[]]>,
        OR_SEARCH: boolean
    ): any {
        const filterObject = {};
        const filterOperations = [];
        for (const filter of ticketFilter) {
            if (TicketServiceUtil.isNumericSearchOperation(filter[1])) {
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: Number(filter[2]),
                    Type: "numeric"
                });
            } else if (TicketServiceUtil.isINSearch(filter[1])) {
                if (!Array.isArray(filter[2])) {
                    filter[2] = (filter[2] as string).split(" ");
                }
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: filter[2],
                    Type: "numeric"
                });
            } else {
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: String(filter[2])
                });
            }
        }

        if (OR_SEARCH) {
            filterObject['OR'] = filterOperations;
        } else {
            filterObject['AND'] = filterOperations;
        }

        return filterObject;
    }

    public static isNumericSearchOperation(operator: SearchOperator): boolean {
        return (
            operator === SearchOperator.LESS_THAN ||
            operator === SearchOperator.LESS_THAN_OR_EQUAL ||
            operator === SearchOperator.GREATER_THAN ||
            operator === SearchOperator.GREATER_THAN_OR_EQUAL
        );
    }

    public static isINSearch(operator: SearchOperator): boolean {
        return operator === SearchOperator.IN;
    }
}
