import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { TiptapEditorConfiguration } from './model/TiptapEditorConfiguration';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return 'Tiptap';
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        return [new TiptapEditorConfiguration()];
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        return [];
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};