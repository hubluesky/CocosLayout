import { UITransform, Vec2, _decorator } from "cc";
import BaseLayout from "./BaseLayout";
import LayoutElement from "./LayoutElement";

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
        return [new Vec2(this.bottom, this.top), new Vec2(this.right, this.left)];
    }

    protected setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(y, x, 0);
    }

    protected getLayoutSize(uiTransform: UITransform): number {
        return uiTransform.height;
    }

    protected getNoLayoutSize(uiTransform: UITransform): number {
        return uiTransform.width;
    }

    protected setLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.height = w;
    }

    protected setNoLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.width = h;
    }

    protected getElementMinSize(element: LayoutElement): number {
        return element.minHeight;
    }

    protected getElementPreferredSize(element: LayoutElement): number {
        return Math.max(element.preferredHeight, element.minHeight);
    }

    protected getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleHeight;
    }
}