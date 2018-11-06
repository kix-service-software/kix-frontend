import { AbstractAction } from '@kix/core/dist/model';

export class ComponentState {

    public constructor(
        public action: AbstractAction = null,
        public displayText: boolean = null
    ) { }

}
