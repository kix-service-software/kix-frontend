import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';

class PersonalSettingsToolbarComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public openPersonalSettings(): void {
        ApplicationService.getInstance().toggleMainDialog('personal-settings-container');
    }

}

module.exports = PersonalSettingsToolbarComponent;
