import { IdService } from "@kix/core/dist/browser/IdService";

export class ObjectInfoOverlayComponentState {

    public constructor(
        public show: boolean = false,
        public content: any = null,
        public data: any = null,
        public position: [number, number] = null,
        public keepShow: boolean = true,
        public instanceId: string = IdService.generateDateBasedId()
    ) { }

}
