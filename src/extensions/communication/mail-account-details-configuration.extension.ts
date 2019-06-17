import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, WidgetSize, ContextConfiguration, ObjectinformationWidgetSettings,
    KIXObjectType, MailAccountProperty, KIXObjectProperty
} from '../../core/model';
import { MailAccountDetailsContext } from '../../core/browser/mail-account/context';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return MailAccountDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const mailAccountInfoLane =
            new ConfiguredWidget('mail-account-information-lane', new WidgetConfiguration(
                'mail-account-info-widget', 'Translatable#Account Information',
                ['mail-account-edit'],
                new ObjectinformationWidgetSettings(KIXObjectType.MAIL_ACCOUNT, [
                    MailAccountProperty.LOGIN,
                    MailAccountProperty.HOST,
                    MailAccountProperty.TYPE,
                    MailAccountProperty.IMAP_FOLDER,
                    MailAccountProperty.TRUSTED,
                    MailAccountProperty.DISPATCHING_BY,
                    MailAccountProperty.COMMENT,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CHANGE_BY,
                    KIXObjectProperty.CHANGE_TIME
                ]),
                false, true, null, false)
            );

        return new ContextConfiguration(
            MailAccountDetailsContext.CONTEXT_ID,
            [], [],
            [], [],
            [], [],
            ['mail-account-info-widget'], [mailAccountInfoLane],
            [], [],
            ['mail-account-create'],
            ['mail-account-edit']
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        return;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
