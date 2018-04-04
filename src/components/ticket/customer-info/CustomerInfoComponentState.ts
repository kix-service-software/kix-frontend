import { Customer } from '@kix/core/dist/model';

export class CustomerInfoComponentState {

    public constructor(
        public customer: Customer = null
    ) { }
}
