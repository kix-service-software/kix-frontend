import { RequestObject } from '../RequestObject';
import { CustomerProperty } from '../../model';

export class UpdateCustomer extends RequestObject {

    public constructor(
        customerId: string = null, customerCompanyName: string = null, customerCompanyStreet: string = null,
        customerCompanyZip = null, customerCompanyCity: string = null, customerCompanyCountry: string = null,
        customerCompanyUrl: string = null, customerCompanyComment: string = null, validId: number = null
    ) {
        super();
        // do not update customer id for the moment
        // this.applyProperty(CustomerProperty.CUSTOMER_ID, customerId);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_NAME, customerCompanyName);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_STREET, customerCompanyStreet);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_ZIP, customerCompanyZip);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_CITY, customerCompanyCity);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_COUNTRY, customerCompanyCountry);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_URL, customerCompanyUrl);
        this.applyProperty(CustomerProperty.CUSTOMER_COMPANY_COMMENT, customerCompanyComment);
        this.applyProperty(CustomerProperty.VALID_ID, validId);
    }

}
