import { Position } from "geojson";
import {
  TerraDrawMouseEvent,
  TerraDrawAdapterStyling,
  TerraDrawKeyboardEvent,
} from "../common";
import { circle } from "../geometry/create-circle";
import { haversineDistanceKilometers } from "../geometry/haversine-distance";
import { TerraDrawBaseDrawMode } from "./base.mode";

type TerraDrawCircleModeKeyEvents = {
  cancel: KeyboardEvent["key"];
};

export class TerraDrawCircleMode extends TerraDrawBaseDrawMode {
  mode = "circle";
  private center: Position;
  private clickCount: number = 0;
  private currentCircleId: string;
  private keyEvents: TerraDrawCircleModeKeyEvents;

  constructor(options?: {
    styling?: Partial<TerraDrawAdapterStyling>;
    keyEvents?: TerraDrawCircleModeKeyEvents;
  }) {
    super(options);

    this.keyEvents =
      options && options.keyEvents ? options.keyEvents : { cancel: "Escape" };
  }

  start() {
    this.setStarted();
    this.setCursor("crosshair");
  }

  stop() {
    this.setStopped();
    this.setCursor("unset");
    this.cleanUp();
  }

  onClick(event: TerraDrawMouseEvent) {
    if (this.clickCount === 0) {
      this.center = [event.lng, event.lat];
      const startingCircle = circle({
        center: this.center,
        radiusKilometers: 0.00001,
      });

      const [createdId] = this.store.create([
        {
          geometry: startingCircle.geometry,
          properties: {
            mode: this.mode,
          },
        },
      ]);
      this.currentCircleId = createdId;
      this.clickCount++;
    } else {
      // Finish drawing
      this.center = undefined;
      this.currentCircleId = undefined;
      this.clickCount = 0;
    }
  }
  onMouseMove(event: TerraDrawMouseEvent) {
    if (this.clickCount === 1) {
      const distanceKm = haversineDistanceKilometers(this.center, [
        event.lng,
        event.lat,
      ]);

      const updatedCircle = circle({
        center: this.center,
        radiusKilometers: distanceKm,
      });

      this.store.updateGeometry([
        { id: this.currentCircleId, geometry: updatedCircle.geometry },
      ]);
    }
  }
  onKeyPress(event: TerraDrawKeyboardEvent) {
    if (event.key === this.keyEvents.cancel) {
      this.cleanUp();
    }
  }
  onDragStart() {}
  onDrag() {}
  onDragEnd() {}
  cleanUp() {
    try {
      this.store.delete([this.currentCircleId]);
    } catch (error) {}
    this.center = undefined;
    this.currentCircleId = undefined;
    this.clickCount = 0;
  }
}