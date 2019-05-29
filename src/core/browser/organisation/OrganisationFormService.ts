import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, Organisation } from "../../model";

export class OrganisationFormService extends KIXObjectFormService<Organisation> {

    private static INSTANCE: OrganisationFormService;

    public static getInstance(): OrganisationFormService {
        if (!OrganisationFormService.INSTANCE) {
            OrganisationFormService.INSTANCE = new OrganisationFormService();
        }
        return OrganisationFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ORGANISATION;
    }

}
