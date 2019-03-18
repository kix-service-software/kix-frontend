import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '201903141358-roles-list',
        public title: string = 'Translatable#User Management: Roles',
        public filterCount: number = null
    ) { }

}
