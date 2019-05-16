import { ObjectFactory } from "./ObjectFactory";
import { Sla, KIXObjectType } from "../../model";

export class SlaFactory extends ObjectFactory<Sla> {

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.SLA;
    }

    public create(sla?: Sla): Sla {
        return new Sla(sla);
    }


}
