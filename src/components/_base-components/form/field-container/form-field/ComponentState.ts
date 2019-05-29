import { FormField } from '../../../../../core/model';
import { AbstractComponentState } from '../../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public field: FormField = null,
        public formId: string = null,
        public minimized: boolean = false,
        public level: number = 0
    ) {
        super();
    }

}
