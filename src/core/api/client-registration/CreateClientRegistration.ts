import { RequestObject } from '../RequestObject';

export class CreateClientRegistration extends RequestObject {

    public constructor(
        public clientId: string,
        public callbackURL: string,
        public authentication: string = null
    ) {
        super();
        this.applyProperty("ClientID", clientId);
        this.applyProperty("CallbackURL", callbackURL);
        this.applyProperty("Authentication", authentication);
    }



}
