/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { OrganisationSearchFormManager } from './OrganisationSearchFormManager';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { SearchDefinition } from '../../../search/webapp/core/SearchDefinition';

export class OrganisationSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.ORGANISATION);
        this.formManager = new OrganisationSearchFormManager();
    }

    public createFormManager(
        ignoreProperties: string[] = [], validDynamicFields: boolean = true
    ): SearchFormManager {
        const formManager = new OrganisationSearchFormManager(ignoreProperties, validDynamicFields);
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

    public getDefaultSearchCriteria(): string[] {
        return [
            SearchProperty.FULLTEXT,
            OrganisationProperty.NAME,
            OrganisationProperty.NUMBER
        ];
    }

}
