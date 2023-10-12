/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ImportRunner } from '../../../../import/webapp/core/ImportRunner';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { Organisation } from '../../../model/Organisation';
import { OrganisationProperty } from '../../../model/OrganisationProperty';

export class OrganisationImportRunner extends ImportRunner {

    public objectType: KIXObjectType = KIXObjectType.ORGANISATION;

    protected getKnownProperties(): string[] {
        return Object.values(OrganisationProperty);
    }

    public async getRequiredProperties(): Promise<string[]> {
        return [OrganisationProperty.NUMBER];
    }

    protected async getSpecificObject(object: any): Promise<Organisation> {
        return new Organisation(object as Organisation);
    }

    protected async getExisting(organisation: Organisation): Promise<KIXObject> {
        if (organisation.ObjectId) {
            return super.getExisting(organisation);
        } else {
            const filter = [
                new FilterCriteria(
                    OrganisationProperty.NUMBER, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, organisation.Number
                )
            ];
            const loadingOptions = new KIXObjectLoadingOptions(filter);
            const organisations = await KIXObjectService.loadObjects(
                this.objectType, null, loadingOptions, null, true
            );
            return organisations && !!organisations.length ? organisations[0] : null;
        }
    }
}