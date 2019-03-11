import { AbstractAction } from '../../../core/model';

export class ComponentState {

    public constructor(
        public action: AbstractAction = null,
        public displayText: boolean = null,
        public text: string = ''
    ) { }

}
