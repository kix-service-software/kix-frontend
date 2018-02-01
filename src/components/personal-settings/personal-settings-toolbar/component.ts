import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';

class PersonalSettingsToolbarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public openPersonalSettings(): void {
        ApplicationStore.getInstance().toggleMainDialog('personal-settings-container');
    }

}

module.exports = PersonalSettingsToolbarComponent;
