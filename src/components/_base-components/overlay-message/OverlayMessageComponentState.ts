import { IdService } from "@kix/core/dist/browser/IdService";

export class OverlayMessageComponentState {

    public constructor(
        public keepShow: boolean = true,
        public instanceId: string = IdService.generateDateBasedId(),
        public title: string = null,
        public message: string = null,
        public show: boolean = false
    ) { }

}
