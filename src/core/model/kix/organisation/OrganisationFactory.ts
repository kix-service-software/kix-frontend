import { Organisation } from "./Organisation";
import { IObjectFactory } from "../IObjectFactory";
import { KIXObjectType } from "../KIXObjectType";

export class OrganisationFactory implements IObjectFactory<Organisation> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.ORGANISATION;
    }

    public create(organisation?: Organisation): Organisation {
        const newOrganisation = new Organisation(organisation);
        return newOrganisation;
    }
}
