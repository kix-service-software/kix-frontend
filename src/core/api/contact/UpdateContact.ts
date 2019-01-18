import { RequestObject } from '../RequestObject';
import { ContactProperty } from '../../model';

export class UpdateContact extends RequestObject {

    public constructor(
        userLogin: string = null, userEmail: string = null, userFirstname: string = null, userLastname: string = null,
        userCustomerId: string = null, userCustomerIds: string = null, userPhone: string = null,
        userCountry: string = null, userTitle: string = null, userFax: string = null, userMobile: string = null,
        userComment: string = null, userStreet: string = null, userCity: string = null, userZip: string = null,
        validId: number = null
    ) {
        super();

        // Wird aktuell noch nicht geändert
        // this.applyProperty(ContactProperty.USER_LOGIN, userLogin);
        this.applyProperty(ContactProperty.USER_EMAIL, userEmail);
        this.applyProperty(ContactProperty.USER_FIRST_NAME, userFirstname);
        this.applyProperty(ContactProperty.USER_LAST_NAME, userLastname);
        this.applyProperty(ContactProperty.USER_CUSTOMER_ID, userCustomerId);
        this.applyProperty(ContactProperty.USER_CUSTOMER_IDS, userCustomerIds);
        this.applyProperty(ContactProperty.USER_PHONE, userPhone);
        this.applyProperty(ContactProperty.USER_COUNTRY, userCountry);
        this.applyProperty(ContactProperty.USER_TITLE, userTitle);
        this.applyProperty(ContactProperty.USER_FAX, userFax);
        this.applyProperty(ContactProperty.USER_MOBILE, userMobile);
        this.applyProperty(ContactProperty.USER_COMMENT, userComment);
        this.applyProperty(ContactProperty.USER_STREET, userStreet);
        this.applyProperty(ContactProperty.USER_CITY, userCity);
        this.applyProperty(ContactProperty.USER_ZIP, userZip);
        this.applyProperty(ContactProperty.VALID_ID, validId);
    }

}
