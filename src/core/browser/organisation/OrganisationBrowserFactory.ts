import { IKIXObjectFactory } from "../kix";
import { Organisation } from "../../model";

export class OrganisationBrowserFactory implements IKIXObjectFactory<Organisation> {

    private static INSTANCE: OrganisationBrowserFactory;

    public static getInstance(): OrganisationBrowserFactory {
        if (!OrganisationBrowserFactory.INSTANCE) {
            OrganisationBrowserFactory.INSTANCE = new OrganisationBrowserFactory();
        }
        return OrganisationBrowserFactory.INSTANCE;
    }

    public async create(organisation: Organisation): Promise<Organisation> {
        return new Organisation(organisation);
    }

}
