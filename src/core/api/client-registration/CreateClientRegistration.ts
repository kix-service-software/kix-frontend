import { RequestObject } from '../RequestObject';
import { PODefinition } from '../../model';

export class CreateClientRegistration extends RequestObject {

    public constructor(
        public ClientID: string,
        public NotificationURL: string,
        public NotificationInterval: number,
        public Authorization: string = null,
        public Translations: PODefinition[] = [],
    ) {
        super();
    }

}
