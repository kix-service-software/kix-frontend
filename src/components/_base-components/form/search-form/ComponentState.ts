import { ITable, AbstractComponentState } from '../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public resultCount: number = 0,
        public canSearch: boolean = false,
        public table: ITable = null
    ) {
        super();
    }

}
