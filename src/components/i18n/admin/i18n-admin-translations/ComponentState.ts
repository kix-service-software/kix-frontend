import { StandardTable } from "../../../../core/browser";
import { KIXObjectPropertyFilter, AbstractAction } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public table: StandardTable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: AbstractAction[] = [],
        public instanceId: string = '201811271234-i18n-translation-list',
        public title: string = 'Internationalisierung: Übersetzungen',
        public filterCount: number = null
    ) { }

}
