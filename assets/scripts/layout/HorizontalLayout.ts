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
        return this.childScaleWidth ? uiTransform.width * uiTransform.node.scale.x : uiTransform.width;
    }

    protected getNoLayoutSize(uiTransform: UITransform): number {
        return this.childScaleHeight ? uiTransform.height * uiTransform.node.scale.y : uiTransform.height;
    }

    protected setLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.width = this.childScaleWidth ? w / uiTransform.node.scale.x : w;
    }

    protected setNoLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.height = this.childScaleHeight ? h / uiTransform.node.scale.y : h;
    }

    protected getElementMinSize(uiTransform: UITransform, element: LayoutElement): number {
        return this.childScaleWidth ? element.minWidth * uiTransform.node.scale.x : element.minWidth;
    }

    protected getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number {
        let width = Math.max(element.preferredWidth, element.minWidth);
        return this.childScaleWidth ? width * uiTransform.node.scale.x : width;
    }

    protected getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleWidth;
    }
}