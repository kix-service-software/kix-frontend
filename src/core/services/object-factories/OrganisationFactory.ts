import { ObjectFactory } from "./ObjectFactory";
import { Organisation, KIXObjectType } from "../../model";

export class OrganisationFactory extends ObjectFactory<Organisation> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ORGANISATION;
    }

    public create(organisation?: Organisation): Organisation {
        const newOrganisation = new Organisation(organisation);
        return newOrganisation;
    }
}
