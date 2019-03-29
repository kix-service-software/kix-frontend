import { RequestObject } from '../RequestObject';
import { CustomerProperty } from '../../model';

export class UpdateCustomer extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        // do not update customer id for the moment
        parameter.filter((p) => p[0] !== CustomerProperty.CUSTOMER_ID).forEach((p) => this.applyProperty(p[0], p[1]));
    }

}
