import { ComponentState } from './ComponentState';
import { ReleaseInfo, SysConfigItem, KIXObjectType, SysConfigKey } from '../../../core/model';
import { ObjectDataService } from '../../../core/browser/ObjectDataService';
import { KIXObjectService } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ComponentInput } from './ComponentInput';
import { AgentService } from '../../../core/browser/application/AgentService';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.releaseInfo = input.releaseInfo;
        this.state.impressLink = input.impressLink;
        this.state.unauthorized = typeof input.unauthorized !== 'undefined' ? input.unauthorized : false;
    }

    public async onMount(): Promise<void> {
        if (!this.state.releaseInfo) {
            const objectData = ObjectDataService.getInstance().getObjectData();
            this.state.releaseInfo = objectData.releaseInfo;
        }

        if (!this.state.unauthorized) {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            this.state.currentUserLogin = currentUser.UserLogin;
        }

        if (this.state.releaseInfo) {
            this.state.kixProduct = this.state.releaseInfo.product;
            this.state.kixVersion = this.state.releaseInfo.version;
            this.state.buildNumber = this.getBuildNumber(this.state.releaseInfo);
        }

        if (!this.state.impressLink) {
            const impressConfig = await KIXObjectService.loadObjects<SysConfigItem>(
                KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.IMPRESS_LINK]
            );

            if (impressConfig && impressConfig.length) {
                const userLanguage = await TranslationService.getUserLanguage();
                const data = impressConfig[0].Data;
                if (data[userLanguage]) {
                    this.state.impressLink = data[userLanguage];
                } else {
                    const defaultLanguage = await TranslationService.getSystemDefaultLanguage();
                    this.state.impressLink = data[defaultLanguage];
                }
            }
        }
    }

    private getBuildNumber(releaseInfo: ReleaseInfo): string {
        const backendBuildNumber = releaseInfo.backendSystemInfo ? releaseInfo.backendSystemInfo.BuildNumber : '';
        return `(Build: ${releaseInfo.buildNumber.toString()}.${backendBuildNumber})`;
    }
}

module.exports = Component;
