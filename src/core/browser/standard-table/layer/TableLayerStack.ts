import { ITableLayer } from "./ITableLayer";

export class TableLayerStack {

    private topLayer: ITableLayer;

    public pushLayer(layer: ITableLayer): void {
        if (this.topLayer) {
            this.topLayer.setNextLayer(layer);
            layer.setPreviousLayer(this.topLayer);
        }

        this.topLayer = layer;
    }

    public getTopLayer(): ITableLayer {
        return this.topLayer;
    }

}
