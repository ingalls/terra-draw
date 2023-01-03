import { Feature, Point } from "geojson";
import { TerraDrawMouseEvent, TerraDrawAdapterStyling, HexColor } from "../../common";
import { GeoJSONStoreFeatures } from "../../store/store";
import { getDefaultStyling } from "../../util/styling";
import { TerraDrawBaseDrawMode } from "../base.mode";

type PointModeStyling = {
    pointWidth: number,
    pointColor: HexColor,
    pointOutlineColor: HexColor
    pointOutlineWidth: number;
}
export class TerraDrawPointMode extends TerraDrawBaseDrawMode<PointModeStyling> {
    mode = "point";

    constructor(options?: { styles?: Partial<PointModeStyling> }) {
        super(options);
    }

    /** @internal */
    start() {
        this.setStarted();
        this.setCursor("crosshair");
    }

    /** @internal */
    stop() {
        this.setStopped();
        this.setCursor("unset");
        this.cleanUp();
    }

    /** @internal */
    onClick(event: TerraDrawMouseEvent) {
        if (!this.store) {
            throw new Error("Mode must be registered first");
        }

        this.store.create([
            {
                geometry: {
                    type: "Point",
                    coordinates: [event.lng, event.lat],
                },
                properties: { mode: this.mode },
            },
        ]);
    }

    /** @internal */
    onMouseMove() { }

    /** @internal */
    onKeyDown() { }

    /** @internal */
    onKeyUp() { }

    /** @internal */
    cleanUp() { }

    /** @internal */
    onDragStart() { }

    /** @internal */
    onDrag() { }

    /** @internal */
    onDragEnd() { }

    /** @internal */
    styleFeature(
        feature: GeoJSONStoreFeatures
    ): TerraDrawAdapterStyling {
        const styles = { ...getDefaultStyling() };

        if (feature.type === 'Feature' && feature.geometry.type === 'Point' && feature.properties.mode === this.mode) {

            if (this.styles.pointColor) {
                styles.pointColor = this.styles.pointColor;
            }
            if (this.styles.pointOutlineColor) {
                styles.pointOutlineColor = this.styles.pointOutlineColor;
            }
            if (this.styles.pointOutlineWidth) {
                styles.pointOutlineWidth = this.styles.pointOutlineWidth;
            }
            if (this.styles.pointWidth) {
                styles.pointWidth = this.styles.pointWidth;
            }

            return styles;
        }

        return styles;
    }
}