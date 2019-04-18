import { Context } from "../../../model";
import { TranslationService } from "../../i18n/TranslationService";

export class CustomerContext extends Context {

    public static CONTEXT_ID: string = 'customers';

    public getIcon(): string {
        return 'kix-icon-customers';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Customers Dashboard');
    }

}
