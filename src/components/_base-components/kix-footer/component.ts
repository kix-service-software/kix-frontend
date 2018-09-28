import { ComponentState } from './ComponentState';
import { KIXObjectService } from '@kix/core/dist/browser';
import { SysConfigItem, SysConfigKey, KIXObjectType } from '@kix/core/dist/model';

class Component {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();

        // FIXME: führt aktuell zu (im Login)
        // Unhandled promise rejection (rejection id: 2): Error: No service registered for object type SysConfigItem
        // ggf. ist es erstmal auch nicht notwendig und der Text "KIX 18 Alpha" würde auch reichen
        const productConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.KIX_PRODUCT]
        );
        const versionConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.KIX_VERSION]
        );

        this.state.kixProduct = productConfig && productConfig.length ? productConfig[0].Data : '';
        this.state.kixVersion = versionConfig && versionConfig.length ? versionConfig[0].Data : '';
        this.state.buildNumber = '123c.123';
    }
}

module.exports = Component;
