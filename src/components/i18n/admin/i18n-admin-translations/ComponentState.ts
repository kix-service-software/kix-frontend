import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";
import { ITable } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '201811271234-i18n-translation-list',
        public title: string = 'Internationalisierung: Übersetzungen',
        public filterCount: number = null
    ) { }

}
