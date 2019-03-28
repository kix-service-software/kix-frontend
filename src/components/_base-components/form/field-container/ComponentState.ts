import { FormField } from '../../../../core/model';
import { AbstractComponentState } from '../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public level: number = 0,
        public fields: FormField[] = []
    ) {
        super();
    }

}
