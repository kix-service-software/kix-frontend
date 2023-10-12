/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../../../server/model/rest/RequestObject';
import { OrganisationProperty } from '../../model/OrganisationProperty';

export class UpdateOrganisation extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.filter((p) => p[0] !== OrganisationProperty.ID).forEach((p) => this.applyProperty(p[0], p[1]));
    }

}
