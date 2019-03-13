import { RequestObject } from '../RequestObject';
import { ContactProperty } from '../../model';

export class UpdateContact extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.forEach((p) => {
            // TODO: Login wird aktuell noch nicht geändert
            if (p[0] !== ContactProperty.USER_LOGIN) {
                this.applyProperty(p[0], p[1]);
            }
        });
    }

}
