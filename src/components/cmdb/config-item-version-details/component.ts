import { ComponentState } from './ComponentState';
import {
    Version, ConfigItem, KIXObjectType, ConfigItemAttachment, DateTimeUtil, LabelValueGroup
} from '@kix/core/dist/model';
import { BrowserUtil, KIXObjectService } from '@kix/core/dist/browser';
import { PreparedData } from '@kix/core/dist/model/kix/cmdb/PreparedData';

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
            this.state.groups = this.prepareLabelValueGroups();
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

    private prepareLabelValueGroups(data: PreparedData[] = this.version.PreparedData): LabelValueGroup[] {
        const groups = [];
        data.forEach((attr) => {
            let value = attr.DisplayValue;
            if (attr.Type === 'Date') {
                value = DateTimeUtil.getLocalDateString(value);
            } else if (attr.Type === 'Attachment') {
                value = attr.Value.Filename;
            }

            groups.push(new LabelValueGroup(
                attr.Label,
                value,
                null,
                null,
                (attr.Sub && attr.Sub.length ? this.prepareLabelValueGroups(attr.Sub) : null),
                (attr.Type === 'Attachment' ? new ConfigItemAttachment(attr.Value) : null)
            ));
        });
        return groups;
    }

}

module.exports = Component;
