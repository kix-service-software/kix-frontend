import { ComponentState } from "./ComponentState";
import { FormInputComponent, MailFilterMatch } from "../../../../../../core/model";
import { IdService, IDynamicFormManager, ObjectPropertyValue } from "../../../../../../core/browser";
import { MailFilterMatchManager } from "../../../../../../core/browser/mail-filter";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private matchFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('mail-filter-match-form-listener-');
        await this.prepareTranslations();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const matchManager = new MailFilterMatchManager();
        if (matchManager) {
            matchManager.init();
            await this.setCurrentNode(matchManager);
            this.state.matchManager = matchManager;
            this.state.matchManager.registerListener(this.formListenerId, () => {
                if (this.matchFormTimeout) {
                    clearTimeout(this.matchFormTimeout);
                }
                this.matchFormTimeout = setTimeout(async () => {
                    const matchValues: MailFilterMatch[] = [];
                    if (this.state.matchManager.hasDefinedValues()) {
                        const values = this.state.matchManager.getEditableValues();
                        values.forEach((v) => {
                            if (v.property && v.value && v.value[0]) {
                                matchValues.push(
                                    new MailFilterMatch(
                                        v.property,
                                        v.value[0],
                                        v.value[1]
                                    )
                                );
                            }
                        });
                    }
                    super.provideValue(matchValues);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.matchManager) {
            this.state.matchManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(matchManager: IDynamicFormManager): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value && Array.isArray(this.state.defaultValue.value)) {
            this.state.defaultValue.value.forEach((match: MailFilterMatch) => {
                matchManager.setValue(
                    new ObjectPropertyValue(match.Key, null, [match.Value, match.Not], null, null, null, match.Key)
                );
            });
            super.provideValue(this.state.defaultValue.value);
        }
    }

    private async prepareTranslations(): Promise<void> {
        const translations: string[] = await TranslationService.createTranslationArray(
            [
                'Translatable#Email Header', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_EmailHeader',
                'Translatable#Negate', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_Negate',
                'Translatable#Pattern', 'Translatable#Helptext_Admin_MailFilter_FilterConditions_Pattern',
            ]
        );
        if (translations && !!translations.length) {
            this.state.translations.set('HeaderTitle', translations[0]);
            this.state.translations.set('HeaderHint', translations[1]);
            this.state.translations.set('NegateTitle', translations[2]);
            this.state.translations.set('NegateHint', translations[3]);
            this.state.translations.set('PatternTitle', translations[4]);
            this.state.translations.set('PatternHint', translations[5]);
        }
    }
}

module.exports = Component;
