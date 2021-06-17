/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContactSearchFormManager } from './ContactSearchFormManager';
import { SearchDefinition, SearchResultCategory } from '../../../search/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../user/model/UserProperty';
import { ContactProperty } from '../../model/ContactProperty';
import { SearchProperty } from '../../../search/model/SearchProperty';

export class ContactSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONTACT);
        this.formManager = new ContactSearchFormManager();
    }

    public getLoadingOptions(criteria: FilterCriteria[]): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, this.limit, ['Tickets'], null);
    }

    public async getSearchResultCategories(): Promise<SearchResultCategory[]> {
        const categories: SearchResultCategory[] = [];

        if (await this.checkReadPermissions('organisations')) {
            categories.push(
                new SearchResultCategory('Translatable#Organisations', KIXObjectType.ORGANISATION)
            );
        }
        if (await this.checkReadPermissions('tickets')) {
            categories.push(
                new SearchResultCategory('Translatable#Tickets', KIXObjectType.TICKET)
            );
        }
        return [new SearchResultCategory('Translatable#Contacts', KIXObjectType.CONTACT, categories)];
    }

    public getDefaultSearchCriteria(): string[] {
        return [
            SearchProperty.FULLTEXT,
            ContactProperty.FIRSTNAME,
            ContactProperty.LASTNAME,
            ContactProperty.EMAIL,
            UserProperty.USER_LOGIN
        ];
    }

}
