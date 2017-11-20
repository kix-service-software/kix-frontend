import { TranslationHandler } from '@kix/core/dist/browser/TranslationHandler';

class PersonalSettingsToolbarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            title: "Persönliche Einstellungen",
            showPersonalSettings: false
        };
    }

    public async onMount(): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.title = await translationHandler.getTranslation('PERSONAL-SETTINGS:TOOLBAR');
    }

    public openPersonalSettings(): void {
        this.state.showPersonalSettings = true;
    }

    public closePersonalSettings(): void {
        this.state.showPersonalSettings = false;
    }

}

module.exports = PersonalSettingsToolbarComponent;
