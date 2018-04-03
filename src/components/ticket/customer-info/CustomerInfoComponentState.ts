import { Customer, CustomerSourceAttributeMap } from '@kix/core/dist/model';

export class CustomerInfoComponentState {

    public constructor(
        public customer: Customer = null,
        public customerAttributeValueMap: Map<string, Map<string, string>> = null
    ) { }
}
