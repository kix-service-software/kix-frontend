import { DynamicFieldValue } from './DynamicFormFieldValue';
import { AbstractComponentState } from '../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public dynamicValues: DynamicFieldValue[] = []
    ) {
        super();
    }

}
