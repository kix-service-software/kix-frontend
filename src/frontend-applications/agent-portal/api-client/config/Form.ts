import { RequestMethod } from '../../../../server/model/rest/RequestMethod';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { APIClient } from '../APIClient';

export class FormAPIClient extends APIClient {

    public static async loadFormConfigurations(): Promise<FormConfiguration[]> {
        const response = await this.executeRequest(RequestMethod.GET, '/config/forms');
        const result = await response.json();
        return result.formConfigurations;
    }

    public static async loadFormConfiguration(formId: string): Promise<FormConfiguration> {
        const response = await this.executeRequest(RequestMethod.GET, `/config/forms/${formId}`);
        const result = await response.json();
        return result.formConfiguration;
    }

    public static async loadFormConfigurationsByContext(
    ): Promise<Array<[FormContext, string, string]>> {
        const response = await this.executeRequest(RequestMethod.GET, '/config/forms/context');
        const result = await response.json();
        return result.formIdsWithContext;
    }

}