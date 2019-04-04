import { KIXObjectPropertyFilter, ObjectIcon } from "../../../core/model";

export class ComponentInput {

    public disabled: boolean;

    public icon: string | ObjectIcon;

    public showFilterCount: boolean;

    public filterCount: number;

    public predefinedFilter: KIXObjectPropertyFilter[];

}
