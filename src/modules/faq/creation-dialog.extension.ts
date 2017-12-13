import { ICreationDialogExtension } from '@kix/core/dist/extensions';
import { CreationDialog } from '@kix/core/dist/model';

export class FAQCreationDialogExtension implements ICreationDialogExtension {
    public getDialog(): CreationDialog {
        return new CreationDialog(
            "faq-creation-dialog",
            "FAQ erstellen",
            "Erstellen eines neuen FAQ Eintrages",
            "",
            this.getTemplatePath()
        );
    }

    private getTemplatePath(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/faq-creation-dialog/';
    }
}

module.exports = (data, host, options) => {
    return new FAQCreationDialogExtension();
};
