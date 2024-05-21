/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { InformationConfiguration } from '../components/object-information-card-widget/ObjectInformationCardConfiguration';
import { LabelService } from './LabelService';
import { ObjectInformationComponentHandler } from './ObjectInformationComponentHandler';
import { OverlayIcon } from './OverlayIcon';
import { PlaceholderService } from './PlaceholderService';

export class ObjectAvatarInformationHandler extends ObjectInformationComponentHandler {

    public async prepareComponentInformation(
        infoValue: InformationConfiguration, value: InformationConfiguration, object: KIXObject
    ): Promise<boolean> {
        const property = value.componentData?.property;
        const text = value.componentData?.text;

        if (!property && !text) {
            console.warn('ObjectAvatarLabel: Required componentData "property" or "text" is missing');
            return false;
        }

        if (property) {
            await this.preparePropertyValue(infoValue, property, object);
        } else {
            infoValue.componentData.displayText = await PlaceholderService.getInstance().replacePlaceholders(
                text, object
            );

            infoValue.componentData.description = await PlaceholderService.getInstance().replacePlaceholders(
                value.componentData.description, object
            );
        }

        return infoValue.componentData.displayText?.length > 0;
    }

    private async preparePropertyValue(
        infoValue: InformationConfiguration, property: string, object: KIXObject
    ): Promise<void> {
        const displayText = await LabelService.getInstance().getDisplayText(object, property);

        const icons = await LabelService.getInstance().getIcons(object, property);
        let icon = icons?.length ? icons[0] : null;

        const description = await LabelService.getInstance().getPropertyText(
            property, object.KIXObjectType, undefined, undefined, object
        );

        const overlayIcon = await this.getOverlayIcon(property, object);

        infoValue.componentData.displayText = displayText;
        infoValue.componentData.icon = icon;
        infoValue.componentData.description = description;
        infoValue.componentData.overlay = overlayIcon;
    }

    private async getOverlayIcon(property: string, object: KIXObject): Promise<OverlayIcon> {
        let overlayIcon: OverlayIcon;
        if (object[property]) {
            overlayIcon = await LabelService.getInstance().getOverlayIconForType(
                object?.KIXObjectType, object[property], property
            );
        }

        return overlayIcon;
    }

}