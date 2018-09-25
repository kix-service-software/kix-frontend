import { ComponentState } from './ComponentState';
import { Version, ConfigItem, TableTreeNode, KIXObjectType, ConfigItemAttachment } from '@kix/core/dist/model';
import { ConfigItemVersionTreeFactory, CMDBService } from '@kix/core/dist/browser/cmdb';
import { ServiceRegistry, BrowserUtil } from '@kix/core/dist/browser';

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
        if (this.version) {
            this.state.nodes = await ConfigItemVersionTreeFactory.createVersionTree(this.version);
        }
    }

    public async nodeClicked(node: TableTreeNode): Promise<void> {
        const service = ServiceRegistry.getInstance().getServiceInstance<CMDBService>(
            KIXObjectType.CONFIG_ITEM_ATTACHMENT
        );

        const attachments = await service.loadObjects<ConfigItemAttachment>(
            KIXObjectType.CONFIG_ITEM_ATTACHMENT, [node.id.AttachmentID]
        );

        if (attachments && attachments.length) {
            BrowserUtil.startBrowserDownload(
                attachments[0].Filename, attachments[0].Content, attachments[0].ContentType
            );
        }
    }

}

module.exports = Component;
