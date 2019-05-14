import { RequestObject } from '../RequestObject';
import { OrganisationProperty } from '../../model';

export class UpdateOrganisation extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.filter((p) => p[0] !== OrganisationProperty.ID).forEach((p) => this.applyProperty(p[0], p[1]));
    }

}
