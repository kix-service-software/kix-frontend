import { VersionComponentState } from './VersionComponentState';
import { ContextService } from '@kix/core/dist/browser/context';
import { SysConfigItem, KIXObjectType, SysConfigKey } from '@kix/core/dist/model';
import { KIXObjectService } from '@kix/core/dist/browser';

export class VersionComponent {

    private state: VersionComponentState;

    public onCreate(): void {
        this.state = new VersionComponentState();
    }

    public async onMount(): Promise<void> {
        const versionConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.KIX_VERSION]
        );
        const productConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.KIX_PRODUCT]
        );

        this.state.kixVersion = versionConfig && versionConfig.length ? versionConfig[0].Data : '';
        this.state.kixProduct = productConfig && productConfig.length ? productConfig[0].Data : '';
    }

}

module.exports = VersionComponent;
