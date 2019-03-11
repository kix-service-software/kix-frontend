import { ILabelProvider } from "../ILabelProvider";
import { KIXObjectType, Sla, ObjectIcon } from "../../model";
import { TranslationService } from "../i18n/TranslationService";

export class SlaLabelProvider implements ILabelProvider<Sla> {

    public kixObjectType: KIXObjectType = KIXObjectType.SLA;

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

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public getDisplayText(sla: Sla, property: string): Promise<string> {
        return sla[property];
    }

    public async getPropertyValueDisplayText(property: string, value: string | number): Promise<string> {
        return "";
    }

    public getDisplayTextClasses(sla: Sla, property: string): string[] {
        return sla[property];
    }

    public getObjectClasses(sla: Sla): string[] {
        return [];
    }

    public async getObjectText(sla: Sla): Promise<string> {
        return "";
    }

    public getObjectAdditionalText(sla: Sla): string {
        return "";
    }

    public getObjectIcon(sla?: Sla): string | ObjectIcon {
        return null;
    }

    public async getObjectName(plural?: boolean): Promise<string> {
        return "SLA";
    }

    public getObjectTooltip(sla: Sla): string {
        return sla.Name;
    }

    public async getIcons(sla: Sla, property: string, value?: string | number): Promise<Array<string | ObjectIcon>> {
        return [];
    }




}
