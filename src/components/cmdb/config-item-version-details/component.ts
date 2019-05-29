import { ComponentState } from './ComponentState';
import {
    Version, ConfigItem, KIXObjectType, ConfigItemAttachment, DateTimeUtil, LabelValueGroup
} from '../../../core/model';
import { BrowserUtil, KIXObjectService } from '../../../core/browser';
import { PreparedData } from '../../../core/model/kix/cmdb/PreparedData';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component {

    private state: ComponentState;
    private version: Version;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.version) {
            this.version = input.version;
        } else if (input.configItem) {
            this.version = (input.configItem as ConfigItem).CurrentVersion;
        }
    }

    public async onMount(): Promise<void> {
        if (this.version && this.version.PreparedData) {
            this.state.groups = await this.prepareLabelValueGroups();
        }
    }

    public async fileClicked(attachment: ConfigItemAttachment): Promise<void> {
        const attachments = await KIXObjectService.loadObjects<ConfigItemAttachment>(
            KIXObjectType.CONFIG_ITEM_ATTACHMENT, [attachment.ID]
        );

        if (attachments && attachments.length) {
            BrowserUtil.startBrowserDownload(
                attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
            );
        }
    }

    private async prepareLabelValueGroups(
        data: PreparedData[] = this.version.PreparedData
    ): Promise<LabelValueGroup[]> {
        const groups = [];
        for (const attr of data) {
            let value = await TranslationService.translate(attr.DisplayValue);
            if (attr.Type === 'Date') {
                value = await DateTimeUtil.getLocalDateString(value);
            } else if (attr.Type === 'Attachment' && attr.Value) {
                value = attr.Value.Filename;
            }

            const subAttributes = (attr.Sub && attr.Sub.length ? await this.prepareLabelValueGroups(attr.Sub) : null);

            const label = await TranslationService.translate(attr.Label);
            groups.push(new LabelValueGroup(
                label, value, null, null, subAttributes,
                (attr.Type === 'Attachment' ? new ConfigItemAttachment(attr.Value) : null)
            ));
        }
        return groups;
    }

}

module.exports = Component;
