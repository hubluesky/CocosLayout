import { UITransform, Vec2, _decorator } from "cc";
import BaseLayout from "./BaseLayout";
import LayoutElement from "./LayoutElement";

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
        return [new Vec2(this.left, this.right), new Vec2(this.top, this.bottom)];
    }

    protected setNodePosition(uiTransform: UITransform, x: number, y: number): void {
        uiTransform.node.setPosition(x, y, 0);
    }

    protected getLayoutSize(uiTransform: UITransform): number {
        return uiTransform.width;
    }

    protected getNoLayoutSize(uiTransform: UITransform): number {
        return uiTransform.height;
    }

    protected setLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.width = w;
    }

    protected setNoLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.height = h;
    }

    protected getElementMinSize(element: LayoutElement): number {
        return element.minWidth;
    }

    protected getElementPreferredSize(element: LayoutElement): number {
        return Math.max(element.preferredWidth, element.minWidth);
    }

    protected getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleWidth;
    }
}