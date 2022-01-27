/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { Organisation } from '../../model/Organisation';
import { EditOrganisationDialogContext } from './context/EditOrganisationDialogContext';
import { NewOrganisationDialogContext } from './context/NewOrganisationDialogContext';

export class OrganisationDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setActiveContext(NewOrganisationDialogContext.CONTEXT_ID);
    }

    public static async edit(organisationId?: string | number): Promise<void> {
        if (!organisationId) {
            const context = ContextService.getInstance().getActiveContext();

            if (context) {
                organisationId = context.getObjectId();
            }
        }

        if (organisationId) {
            ContextService.getInstance().setActiveContext(EditOrganisationDialogContext.CONTEXT_ID, organisationId);
        }
    }

    public static async duplicate(organisation: Organisation): Promise<void> {
        ContextService.getInstance().setActiveContext(NewOrganisationDialogContext.CONTEXT_ID, organisation?.ID);
    }

}
