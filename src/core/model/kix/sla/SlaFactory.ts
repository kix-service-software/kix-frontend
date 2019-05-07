import { IObjectFactory } from "../IObjectFactory";
import { Sla } from "./Sla";
import { KIXObjectType } from "../KIXObjectType";

export class SlaFactory implements IObjectFactory<Sla> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SLA;
    }

    public create(sla?: Sla): Sla {
        return new Sla(sla);
    }


}
