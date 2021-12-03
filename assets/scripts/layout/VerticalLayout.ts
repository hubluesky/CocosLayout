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
        return this.childScaleHeight ? uiTransform.height * uiTransform.node.scale.y : uiTransform.height;
    }

    protected getNoLayoutSize(uiTransform: UITransform): number {
        return this.childScaleWidth ? uiTransform.width * uiTransform.node.scale.x : uiTransform.width;
    }

    protected setLayoutSize(uiTransform: UITransform, h: number): void {
        uiTransform.height = this.childScaleHeight ? h / uiTransform.node.scale.y : h;
    }

    protected setNoLayoutSize(uiTransform: UITransform, w: number): void {
        uiTransform.width = this.childScaleWidth ? w / uiTransform.node.scale.x : w;
    }

    protected getElementMinSize(uiTransform: UITransform, element: LayoutElement): number {
        return this.childScaleHeight ? element.minHeight * uiTransform.node.scale.y : element.minHeight;
    }

    protected getElementPreferredSize(uiTransform: UITransform, element: LayoutElement): number {
        let height = Math.max(element.preferredHeight, element.minHeight);
        return this.childScaleHeight ? height * uiTransform.node.scale.y : height;
    }

    protected getElementFlexibleSize(element: LayoutElement): number {
        return element.flexibleHeight;
    }
}