/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketSearchContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { SearchForm } from '../../modules/base-components/webapp/core/SearchForm';
import { FormContext } from '../../model/configuration/FormContext';
import { SearchProperty } from '../search/model/SearchProperty';
import { TicketProperty } from './model/TicketProperty';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketSearchContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Search', ConfigurationType.Context, this.getModuleId(), [], []
            )
        );

        return configurations;
    }


    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-search-form';
        configurations.push(
            new SearchForm(
                formId, 'Ticket Search', KIXObjectType.TICKET, FormContext.SEARCH, null,
                [SearchProperty.FULLTEXT, TicketProperty.TITLE, TicketProperty.QUEUE_ID]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.SEARCH], KIXObjectType.TICKET, formId);

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
