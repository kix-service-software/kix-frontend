/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { NewOrganisationDialogContext, OrganisationDetailsContext, EditOrganisationDialogContext } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { Organisation } from '../../model/Organisation';

export class OrganisationDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewOrganisationDialogContext.CONTEXT_ID, KIXObjectType.ORGANISATION, ContextMode.CREATE
        );
    }

    public static async edit(organisationId?: string | number): Promise<void> {
        if (!organisationId) {
            const context = await ContextService.getInstance().getContext<OrganisationDetailsContext>(
                OrganisationDetailsContext.CONTEXT_ID
            );

            if (context) {
                organisationId = context.getObjectId();
            }
        }

        if (organisationId) {
            ContextService.getInstance().setDialogContext(
                EditOrganisationDialogContext.CONTEXT_ID, KIXObjectType.ORGANISATION, ContextMode.EDIT, organisationId
            );
        }
    }

    public static async duplicate(organisation: Organisation): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewOrganisationDialogContext.CONTEXT_ID, KIXObjectType.ORGANISATION, ContextMode.CREATE, organisation.ID
        );
    }

}
