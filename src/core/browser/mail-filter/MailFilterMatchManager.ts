import { KIXObjectType, InputFieldTypes, SysConfigKey, SysConfigOption } from "../../model";
import { DynamicFormOperationsType, AbstractDynamicFormManager } from "../form";
import { KIXObjectService } from "../kix";

export class MailFilterMatchManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return 'SPECIFIC';
    }

    public getSpecificInput(): string {
        return 'mail-filter-match-input';
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const headerConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.POSTMASTER_X_HEADER]
        ).catch((error) => []);
        let header = [];
        if (headerConfig && !!headerConfig.length) {
            header = headerConfig[0].Value.sort().map((h) => [h, h]);
        }
        return header;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return '';
    }

    public async propertiesAreUnique(): Promise<boolean> {
        return true;
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return;
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.NONE;
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }

    public showValueInput(): boolean {
        return true;
    }

    public async clearValueOnPropertyChange(property: string): Promise<boolean> {
        return false;
    }
}
