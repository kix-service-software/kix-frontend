import { TranslationHandler } from '@kix/core/dist/model/client';

class PersonalSettingsToolbarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            title: "Persönliche Einstellungen"
        };
    }

    public async onMount(): Promise<void> {
        const translationHandler = await TranslationHandler.getInstance();
        this.state.title = await translationHandler.getTranslation('PERSONAL-SETTINGS:TOOLBAR');
    }

    public openPersonalSettings(event: any): void {
        alert('Personal Settings');
    }

}

module.exports = PersonalSettingsToolbarComponent;
