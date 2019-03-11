import { RequestObject } from '../RequestObject';
import { PODefinition } from '../../model';

export class CreateClientRegistration extends RequestObject {

    public constructor(
        clientId: string, callbackURL: string,
        authentication: string = null, translations: PODefinition[] = [],
    ) {
        super();
        this.applyProperty('ClientID', clientId);
        this.applyProperty('CallbackURL', callbackURL);
        this.applyProperty('Authentication', authentication);
        this.applyProperty('Translations', translations);
    }

}
