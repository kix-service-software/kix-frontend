import { ContextService } from "../context";
import { NewOrganisationDialogContext, OrganisationDetailsContext, EditOrganisationDialogContext } from "./context";
import { KIXObjectType, ContextMode } from "../../model";

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
}
