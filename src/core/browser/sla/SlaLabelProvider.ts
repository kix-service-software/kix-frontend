import { KIXObjectType, Sla } from "../../model";
import { LabelProvider } from "../LabelProvider";

export class SlaLabelProvider extends LabelProvider<Sla> {

    public kixObjectType: KIXObjectType = KIXObjectType.SLA;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(sla: Sla): boolean {
        return sla instanceof Sla;
    }

    public getDisplayText(sla: Sla, property: string): Promise<string> {
        return sla[property];
    }

    public getDisplayTextClasses(sla: Sla, property: string): string[] {
        return sla[property];
    }

    public async getObjectName(plural?: boolean): Promise<string> {
        return "SLA";
    }

    public getObjectTooltip(sla: Sla): string {
        return sla.Name;
    }




}
