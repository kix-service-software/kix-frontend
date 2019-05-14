import { Context } from "../../../model";
import { TranslationService } from "../../i18n/TranslationService";

export class OrganisationContext extends Context {

    public static CONTEXT_ID: string = 'organisations';

    public getIcon(): string {
        return 'kix-icon-organisation';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Organisations Dashboard');
    }

}
