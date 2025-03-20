/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { ContextPreference } from '../../../../../model/ContextPreference';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ConfigItem } from '../../../model/ConfigItem';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { VersionProperty } from '../../../model/VersionProperty';

export class CompareConfigItemVersionContext extends Context {

    public static CONTEXT_ID: string = 'compare-config-item-version-context';

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        const configItem = await this.getObject<ConfigItem>();

        this.handleURLParams(urlParams);

        const versionIds = this.getAdditionalInformation('VERSION_IDS');

        if (configItem && Array.isArray(versionIds)) {
            const versions = configItem.Versions.filter((v) => versionIds.some((vid) => vid === v.VersionID));
            this.setObjectList(KIXObjectType.CONFIG_ITEM_VERSION, versions);
            this.setObjectList('ALL_VERSIONS', configItem.Versions);
        }
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        if (urlParams && urlParams.has('versionIds')) {
            const versionIdsString = decodeURI(urlParams.get('versionIds'));
            if (versionIdsString) {
                this.setAdditionalInformation('VERSION_IDS', versionIdsString.split(',').map((v) => Number(v)));
            }
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];

            const versionIds = this.getAdditionalInformation('VERSION_IDS');
            if (Array.isArray(versionIds)) {
                params.push(`versionIds=${encodeURIComponent(versionIds.join(','))}`);
            }

            if (params.length) {
                url += `/${this.getObjectId()}?${params.join('&')}`;
            }
        }
        return url;
    }

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        const configItem = await this.getObject<ConfigItem>();
        const configItemName = await LabelService.getInstance().getObjectText(configItem);

        const text = await TranslationService.translate('Translatable#Compare: {0}', [configItemName]);
        return text;
    }

    public async getObject<O extends KIXObject>(objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM): Promise<O> {
        const object = await this.loadConfigItem();
        return object as any;
    }

    private async loadConfigItem(changedProperties: string[] = [], cache: boolean = true): Promise<ConfigItem> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                ConfigItemProperty.VERSIONS,
                VersionProperty.DATA,
                VersionProperty.PREPARED_DATA,
                VersionProperty.DEFINITION
            ]
        );

        const configItem = await this.loadDetailsObject<ConfigItem>(KIXObjectType.CONFIG_ITEM, loadingOptions);
        return configItem;
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        await super.addStorableAdditionalInformation(contextPreference);
        contextPreference['VERSION_IDS'] = this.getAdditionalInformation('VERSION_IDS');
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        await super.loadAdditionalInformation(contextPreference);
        if (contextPreference) {
            this.setAdditionalInformation('VERSION_IDS', contextPreference['VERSION_IDS']);
        }
    }
}
