/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
