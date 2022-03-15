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
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';

export class ContactSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.CONTACT);
        this.formManager = new ContactSearchFormManager();
    }

    public createFormManager(
        ignoreProperties: string[] = [], validDynamicFields: boolean = true
    ): SearchFormManager {
        const formManager = new ContactSearchFormManager(ignoreProperties, validDynamicFields);
        formManager.init = (): void => {

            // get extended managers on init because they could be added after filterManager was created
            if (this.formManager) {
                formManager['extendedFormManager'] = [];
                this.formManager.getExtendedFormManager().forEach(
                    (m) => formManager.addExtendedFormManager(m)
                );
            }
        };
        return formManager;
    }

    public getLoadingOptions(criteria: FilterCriteria[], limit: number): KIXObjectLoadingOptions {
        return new KIXObjectLoadingOptions(criteria, null, limit, ['Tickets'], null);
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
