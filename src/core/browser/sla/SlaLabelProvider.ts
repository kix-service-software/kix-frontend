import { KIXObjectType, Sla, ObjectIcon } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class SlaLabelProvider extends LabelProvider<Sla> {

    public kixObjectType: KIXObjectType = KIXObjectType.SLA;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(sla: Sla): boolean {
        return sla instanceof Sla;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue;
        switch (property) {
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
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
