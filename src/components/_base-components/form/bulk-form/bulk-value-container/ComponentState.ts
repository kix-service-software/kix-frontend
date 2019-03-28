import { BulkValue } from './BulkValue';
import { AbstractComponentState } from '../../../../../core/browser';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public bulkValues: BulkValue[] = []
    ) {
        super();
    }

}
