import { ComponentState } from "./ComponentState";
import { FormInputComponent, MailFilterSet, } from "../../../../../../core/model";
import { IdService, IDynamicFormManager } from "../../../../../../core/browser";
import { MailFilterSetManager } from "../../../../../../core/browser/mail-filter";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private matchFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('mail-filter-set-form-listener-');
        await this.prepareTranslations();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const matchManager = new MailFilterSetManager();
        if (matchManager) {
            matchManager.init();
            await this.setCurrentNode(matchManager);
            this.state.setManager = matchManager;
            this.state.setManager.registerListener(this.formListenerId, () => {
                if (this.matchFormTimeout) {
                    clearTimeout(this.matchFormTimeout);
                }
                this.matchFormTimeout = setTimeout(async () => {
                    const setValues: MailFilterSet[] = [];
                    if (this.state.setManager.hasDefinedValues()) {
                        const values = this.state.setManager.getEditableValues();
                        values.forEach((v) => {
                            if (v.property && v.value && v.value) {
                                setValues.push(
                                    new MailFilterSet(
                                        v.property,
                                        v.value
                                    )
                                );
                            }
                        });
                    }
                    super.provideValue(setValues);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.setManager) {
            this.state.setManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(setManager: IDynamicFormManager): Promise<void> {
        //
    }

    private async prepareTranslations(): Promise<void> {
        const translations: string[] = await TranslationService.createTranslationArray(
            [
                'Translatable#Set Email Header', 'Translatable#Helptext_Admin_MailFilter_SetEmailHeader_EmailHeader',
                'Translatable#Set Value', 'Translatable#Helptext_Admin_MailFilter_SetEmailHeader_Value',
            ]
        );
        if (translations && !!translations.length) {
            this.state.translations.set('HeaderTitle', translations[0]);
            this.state.translations.set('HeaderHint', translations[1]);
            this.state.translations.set('ValueTitle', translations[2]);
            this.state.translations.set('ValueHint', translations[3]);
        }
    }
}

module.exports = Component;
