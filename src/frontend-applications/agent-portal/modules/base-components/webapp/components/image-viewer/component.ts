/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IImageDialogListener } from '../../core/IImageDialogListener';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DisplayImageDescription } from '../../core/DisplayImageDescription';
import { EventService } from '../../core/EventService';
import { ImageViewerEvent } from '../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../agent-portal/model/ImageViewerEventData';

export class Component implements IImageDialogListener {

    private state: ComponentState;
    private currImageIndex: number = 0;
    private keyDownEventFunction: () => {
        // do nothing ...
    };

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        EventService.getInstance().subscribe(ImageViewerEvent.OPEN_VIEWER, {
            eventSubscriberId: 'image-viewer',
            eventPublished: async (data: ImageViewerEventData) => {
                if (data && data.imageDescriptions) {
                    if (this.state.show) {
                        this.close();
                    }
                    this.open(data.imageDescriptions, data.showImageId);
                }
            }
        });

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Next Image', 'Translatable#Previous Image', 'Translatable#Download'
        ]);
    }

    public open(imageDescriptions: DisplayImageDescription[], showImageId?: string | number): void {
        this.state.show = true;
        this.state.imageDescriptions = imageDescriptions;

        this.currImageIndex = showImageId ? this.state.imageDescriptions.findIndex(
            (id) => id.imageId === showImageId
        ) : 0;
        this.state.image = this.state.imageDescriptions[this.currImageIndex];

        setTimeout(() => {
            this.keyDownEventFunction = this.handleKeyEvent.bind(this);
            document.body.addEventListener('keydown', this.keyDownEventFunction, false);
        }, 50);
    }

    public preventPropagation(event: any): void {
        if (event) {
            event.stopPropagation();
            // do not use preventDefault, or "download"-click will not work
            // event.preventDefault();
        }
    }

    private handleKeyEvent(event: any): void {
        if (event && event.key === 'Escape') {
            event.stopPropagation();
            this.close();
        }
    }

    public close(): void {
        if (this.keyDownEventFunction) {
            document.body.removeEventListener('keydown', this.keyDownEventFunction, false);
        }
        this.state.show = false;
    }

    public previousImage(): void {
        if (this.state.imageDescriptions.length > 1) {
            const previousIndex = this.currImageIndex - 1;
            if (previousIndex > -1 && this.state.imageDescriptions[previousIndex]) {
                this.currImageIndex = previousIndex;
            } else {
                this.currImageIndex = this.state.imageDescriptions.length - 1;
            }
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }

    public nextImage(): void {
        if (this.state.imageDescriptions.length > 1) {
            const nextIndex = this.currImageIndex + 1;
            if (nextIndex <= this.state.imageDescriptions.length && this.state.imageDescriptions[nextIndex]) {
                this.currImageIndex = nextIndex;
            } else {
                this.currImageIndex = 0;
            }
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }
}

module.exports = Component;
