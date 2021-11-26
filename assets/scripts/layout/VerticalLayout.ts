import { UITransform, Vec2, _decorator } from "cc";
import BaseLayout from "./BaseLayout";

const { ccclass, menu } = _decorator;
@ccclass
@menu("Layout/VerticalLayout")
export default class VerticalLayout extends BaseLayout {
    protected get layoutType() { return this.verticalAlignment; }

    protected get alignment() { return this.horizontalAlignment; }

    protected get sign(): number { return -1; }

    protected getNodeAnchor(uiTransform: UITransform): Vec2 {
        return new Vec2(1 - uiTransform.anchorY, 1 - uiTransform.anchorX);
    }

    protected getMargins(): Vec2[] {
        return [new Vec2(this.border.top, this.border.bottom), new Vec2(this.border.left, this.border.right)];
    }

    protected setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(y, x, 0);
    }

    protected getNodeWidth(uiTransform: UITransform): number {
        return uiTransform.height;
    }

    protected getNodeHeight(uiTransform: UITransform): number {
        return uiTransform.width;
    }

    protected setNodeWidth(uiTransform: UITransform, w: number): void {
        uiTransform.height = w;
    }

    protected setNodeHeight(uiTransform: UITransform, h: number): void {
        uiTransform.width = h;
    }
}