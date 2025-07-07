/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ElasticSearch } from '../../../model/ElasticSearch';
import { ElasticSearchContext } from '../../core/ElasticSearchContext';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: ElasticSearchContext;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<ElasticSearchContext>();
        const result: ElasticSearch = this.context.getAdditionalInformation('searchresult');
        this.state.ticketCount = result[0].Ticket.length;
        this.state.assetCount = result[0].Asset.length;
        this.state.organisationCount = result[0].Organisation.length;
        this.state.contactCount = result[0].Contact.length;
        this.state.faqCount = result[0].FAQ.length;
        this.createTicketTable(result);
        this.createAssetTable(result);
        this.createOrganisationTable(result);
        this.createContactTable(result);
        this.createFAQTable(result);
    }

    public createTicketTable(result: ElasticSearch): void {
        const tbody = document.getElementById('ttb');
        for (let i of result[0].Ticket) {
            const data = [
                i.PriorityID, i.TicketNumber, i.Title, i.StateID, i.LockID, i.QueueID,
                i.ResponsibleID, i.OwnerID, i.OrganisationID, i.Changed
            ];
            const trb = document.createElement('tr');
            for (let i of data) {
                const td = document.createElement('td');
                td.innerHTML = i;
                td.className = 'elastic-cell';
                trb.appendChild(td);
            }
            tbody.appendChild(trb);
        }
    }

    public createAssetTable(result: ElasticSearch): void {
        const tbody = document.getElementById('atb');
        for (let i of result[0].Asset) {
            const data = [
                i.Number, i.Name, i.CurDeplState, i.CurInciState, i.Class,
                i.ChangeTime, i.ChangeBy
            ];
            const trb = document.createElement('tr');
            for (let i of data) {
                const td = document.createElement('td');
                td.innerHTML = i;
                td.className = 'elastic-cell';
                trb.appendChild(td);
            }
            tbody.appendChild(trb);
        }
    }

    public createOrganisationTable(result: ElasticSearch): void {
        const tbody = document.getElementById('otb');
        for (let i of result[0].Organisation) {
            const data = [
                i.Number, i.Name, i.Country, i.City, i.Street, i.ValidID
            ];
            const trb = document.createElement('tr');
            for (let i of data) {
                const td = document.createElement('td');
                td.innerHTML = i;
                td.className = 'elastic-cell';
                trb.appendChild(td);
            }
            tbody.appendChild(trb);
        }
    }

    public createContactTable(result: ElasticSearch): void {
        const tbody = document.getElementById('ctb');
        for (let i of result[0].Contact) {
            const data = [
                i.Firstname, i.Lastname, i.Email, i.Login, i.OrganisationIDs[0], null, null, i.Phone,
                i.Country, i.City, i.Street, i.ValidID
            ];
            const trb = document.createElement('tr');
            for (let i of data) {
                const td = document.createElement('td');
                td.innerHTML = i;
                td.className = 'elastic-cell';
                trb.appendChild(td);
            }
            tbody.appendChild(trb);
        }
    }

    public createFAQTable(result: ElasticSearch): void {
        const tbody = document.getElementById('ftb');
        for (let i of result[0].FAQ) {
            const data = [
                i.Number, i.Title, i.Language, i.CustomerVisible, null, i.CategoryID,
                i.ChangeTime, i.ChangeBy, i.ValidID
            ];
            const trb = document.createElement('tr');
            for (let i of data) {
                const td = document.createElement('td');
                td.innerHTML = i;
                td.className = 'elastic-cell';
                trb.appendChild(td);
            }
            tbody.appendChild(trb);
        }
    }

}

module.exports = Component;
