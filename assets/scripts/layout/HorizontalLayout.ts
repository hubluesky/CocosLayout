import { UITransform, Vec2, _decorator } from "cc";
import BaseLayout from "./BaseLayout";

const { ccclass, menu, executeInEditMode } = _decorator;
@ccclass
@menu("Layout/HorizontalLayout")
@executeInEditMode
export default class HorizontalLayout extends BaseLayout {

    protected get layoutType() { return this.horizontalAlignment; }

    protected get alignment() { return this.verticalAlignment; }

    protected get sign(): number { return 1; }

    protected getNodeAnchor(uiTransform: UITransform): Vec2 {
        return uiTransform.anchorPoint;
    }

    protected getMargins(): Vec2[] {
        return [new Vec2(this.border.left, this.border.right), new Vec2(this.border.top, this.border.bottom)];
    }

    protected setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(x, y, 0);
    }

    protected getNodeWidth(uiTransform: UITransform): number {
        return uiTransform.width;
    }

    protected getNodeHeight(uiTransform: UITransform): number {
        return uiTransform.height;
    }

    protected setNodeWidth(uiTransform: UITransform, w: number): void {
        uiTransform.width = w;
    }

    protected setNodeHeight(uiTransform: UITransform, h: number): void {
        uiTransform.height = h;
    }
}