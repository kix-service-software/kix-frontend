import { Sla } from "../../model";
import { IKIXObjectFactory } from "../kix";

export class SlaBrowserFactory implements IKIXObjectFactory<Sla> {

    private static INSTANCE: SlaBrowserFactory;

    public static getInstance(): SlaBrowserFactory {
        if (!SlaBrowserFactory.INSTANCE) {
            SlaBrowserFactory.INSTANCE = new SlaBrowserFactory();
        }
        return SlaBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(sla: Sla): Promise<Sla> {
        return new Sla(sla);
    }

}
