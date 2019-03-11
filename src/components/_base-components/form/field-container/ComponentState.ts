import { FormField } from '../../../../core/model';

export class ComponentState {

    public constructor(
        public level: number = 0,
        public fields: FormField[] = []
    ) { }

}
