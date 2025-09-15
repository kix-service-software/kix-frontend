import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { QuillEditorConfiguration } from './model/QuillEditorConfiguration';

export class Extension extends KIXExtension implements IConfigurationExtension {
    public getModuleId(): string {
        return 'QuillEditor';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        return [new QuillEditorConfiguration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};