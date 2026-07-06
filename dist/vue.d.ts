import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { ComputedRef } from 'vue';
import { default as default_2 } from 'ol/Map';
import { default as default_3 } from 'ol/layer/Image';
import { default as default_4 } from 'ol/source/ImageCanvas';
import { DefineComponent } from 'vue';
import { PublicProps } from 'vue';

declare const __VLS_component: DefineComponent<__VLS_Props_2, {
getSlider: () => LegendRangeSlider | null;
setDisplayRange: (min: number, max: number) => void | undefined;
getDisplayRange: () => {
displayMin: number;
displayMax: number;
} | null;
setLegendMode: (mode: "gradient" | "blocks") => void | undefined;
layer: ComputedRef<LayerControlApi>;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
change: (range: {
displayMin: number;
displayMax: number;
}) => any;
}, string, PublicProps, Readonly<__VLS_Props_2> & Readonly<{
onChange?: ((range: {
displayMin: number;
displayMax: number;
}) => any) | undefined;
}>, {
precision: number;
title: string;
legendMode: "gradient" | "blocks";
showTitle: boolean;
placement: LegendPanelPlacement;
}, {}, {}, {}, string, ComponentProvideOptions, false, {
sliderHost: HTMLDivElement;
}, HTMLDivElement>;

declare type __VLS_Props = {
    map: default_2 | null | undefined;
    dataUrl?: string;
    data?: ArrayDataJson;
    showChoropleth?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    choroplethOpacity?: number;
    choroplethZIndex?: number;
    labelsZIndex?: number;
    labelDistance?: number;
    labelPrecision?: number;
    labelFontSize?: number;
    colorRamp?: ColorRampItem[];
    legendMin?: number;
    legendMax?: number;
    displayMin?: number;
    displayMax?: number;
    autoFit?: boolean;
    fitPadding?: number | [number, number, number, number];
    fitMaxZoom?: number;
    /** 创建时绑定鼠标拾取，等价于 onPointerMove 回调 */
    onPointerMove?: (event: GridMapPointerEvent) => void;
};

declare type __VLS_Props_2 = {
    overlay?: GridMapView | null;
    colorRamp?: ColorRampItem[];
    legendTicks?: number[];
    /** 直接传入：gradient | blocks，默认 blocks */
    legendMode?: "gradient" | "blocks";
    displayMin?: number;
    displayMax?: number;
    precision?: number;
    title?: string;
    showTitle?: boolean;
    placement?: LegendPanelPlacement;
    background?: string;
    width?: string | number;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: number;
    bottom?: string | number;
    right?: string | number;
    left?: string | number;
    top?: string | number;
    font?: string;
};

declare type __VLS_Props_3 = {
    overlay?: GridMapView | null;
    /** 外部色带（数值间隔可不规则） */
    colorRamp?: ColorRampItem[];
    /** 图例刻度；不传则从 colorRamp 提取 */
    legendTicks?: number[];
    /** gradient 连续色带 | blocks 离散色块 */
    legendMode?: "gradient" | "blocks";
    displayMin?: number;
    displayMax?: number;
    precision?: number;
    title?: string;
};

declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        controls?(_: {
            overlay: GridMapView | null | undefined;
            layer: LayerControlApi;
        }): any;
    };
    refs: {
        sliderHost: HTMLDivElement;
    };
    rootEl: HTMLDivElement;
};

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

/** 与 arrayData.json 一致的网格数据格式 */
declare interface ArrayDataJson {
    startLat: number;
    endLat: number;
    startLon: number;
    endLon: number;
    latStep: number;
    lonStep: number;
    latCount: number;
    lonCount: number;
    ds: number[][];
}

/**
 * 网格数据加载器：主线程保留 flat 副本供同步拾取，LOD/标注计算走 Worker。
 */
declare class ArrayDataLoader {
    private meta;
    private flat;
    private loaded;
    private worker;
    private lastExtent;
    private lastZoom;
    private cachedTile;
    private tileRequestId;
    get bbox(): [number, number, number, number];
    get metadata(): {
        nodata: number;
        bbox: [number, number, number, number];
        startLat: number;
        endLat: number;
        startLon: number;
        endLon: number;
        latStep: number;
        lonStep: number;
        latCount: number;
        lonCount: number;
    };
    get isLoaded(): boolean;
    load(url: string): Promise<void>;
    /** 直接加载 JSON 对象（Vue / Node 传入内存数据时使用） */
    loadData(json: ArrayDataJson): Promise<void>;
    getLodStep(zoom: number): number;
    getLabelStep(zoom: number, resolution: number, distancePx: number, projCode?: string): number;
    /** 异步 readWindow（Worker） */
    readWindowAsync(extent4326: number[], zoom: number): Promise<GridTile | null>;
    /** 同步 readWindow（Worker 未就绪时 fallback） */
    readWindow(extent4326: number[], zoom: number): GridTile | null;
    computeLabelsAsync(extent4326: number[], zoom: number, resolution: number, distancePx: number, precision: number, projCode?: string): Promise<GridLabel[]>;
    computeLabelsSync(extent4326: number[], zoom: number, resolution: number, distancePx: number, precision: number, projCode?: string): GridLabel[];
    getValueAt(lon: number, lat: number, tile?: GridTile | null): number | null;
    getNativeValueAt(lon: number, lat: number): number | null;
    computeStats(): {
        min: number;
        max: number;
    };
    get nativeResolution(): [number, number];
    get gridOrigin(): [number, number];
    invalidateCache(): void;
    dispose(): void;
}

declare class ChoroplethLayer extends default_3<default_4> {
    private loader;
    private glCanvas;
    private displayCanvas;
    private renderer;
    private legend;
    private currentTile;
    private showGridLines;
    private colorRamp;
    private displayMin;
    private displayMax;
    private mapRef;
    private fetchVersion;
    private viewUnbind;
    private readonly onMapChange;
    constructor(options: ChoroplethLayerOptions);
    /** 当前图例数值范围 */
    getLegendRange(): {
        min: number;
        max: number;
    };
    getColorRamp(): ColorRampItem[];
    /** 设置完整色带并刷新渲染 */
    setColorRamp(colorRamp: ColorRampItem[]): void;
    /** 仅调整图例 min/max（保留当前色带样式） */
    setLegendRange(min: number, max: number): void;
    /** 色斑图实际显示的数值区间（滑块控制） */
    getDisplayRange(): {
        min: number;
        max: number;
    };
    setDisplayRange(min: number, max: number): void;
    private clampDisplayRange;
    private refreshRender;
    getShowGrid(): boolean;
    private rebuildLegend;
    setShowGrid(show: boolean): void;
    refreshData(): void;
    private scheduleFetch;
    private renderFrame;
    attachMap(map: default_2): void;
    reattachView(map: default_2): void;
    private bindView;
    getDataValue(lon: number, lat: number): number | null;
    dispose(): void;
}

declare interface ChoroplethLayerOptions {
    loader: ArrayDataLoader;
    colorRamp?: ColorRampItem[];
    opacity?: number;
    showGrid?: boolean;
    zIndex?: number;
}

declare type ColorRampItem = [number, [number, number, number, number]];

export declare interface DisplayRange {
    min: number;
    max: number;
}

export declare const GredGridMap: DefineComponent<__VLS_Props, {
getOverlay: () => GridMapView | null;
fitToData: () => void | undefined;
refreshView: () => void | undefined;
getValueAt: (lon: number, lat: number) => number | null;
getLayerVisibility: () => GridLayerVisibility | null;
setLayerVisibility: (v: Partial<GridLayerVisibility>) => void | undefined;
setShowChoropleth: (visible: boolean) => void | undefined;
setShowGrid: (visible: boolean) => void | undefined;
setShowLabels: (visible: boolean) => void | undefined;
getLegendRange: () => LegendRange_2 | null;
setLegendRange: (min: number, max: number) => void;
getDisplayRange: () => DisplayRange | null;
setDisplayRange: (min: number, max: number) => void;
setColorRamp: (ramp: ColorRampItem[]) => void;
onPointerMove: (handler: (ev: GridMapPointerEvent) => void) => () => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
error: (message: string) => any;
pointermove: (event: GridMapPointerEvent) => any;
ready: (view: GridMapView) => any;
load: (stats: GridMapStats) => any;
"legend-change": (range: DisplayRange) => any;
"display-change": (range: DisplayRange) => any;
}, string, PublicProps, Readonly<__VLS_Props> & Readonly<{
onError?: ((message: string) => any) | undefined;
onPointermove?: ((event: GridMapPointerEvent) => any) | undefined;
onReady?: ((view: GridMapView) => any) | undefined;
onLoad?: ((stats: GridMapStats) => any) | undefined;
"onLegend-change"?: ((range: DisplayRange) => any) | undefined;
"onDisplay-change"?: ((range: DisplayRange) => any) | undefined;
}>, {
showChoropleth: boolean;
showGrid: boolean;
showLabels: boolean;
choroplethOpacity: number;
choroplethZIndex: number;
labelsZIndex: number;
labelDistance: number;
labelPrecision: number;
labelFontSize: number;
autoFit: boolean;
fitPadding: number | [number, number, number, number];
fitMaxZoom: number;
}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

export declare const GredLegendPanel: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

export declare const GredLegendSlider: DefineComponent<__VLS_Props_3, {
setDisplayRange: (min: number, max: number) => void | undefined;
getDisplayRange: () => {
displayMin: number;
displayMax: number;
} | null;
getLegendTicks: () => number[];
setLegendMode: (mode: "gradient" | "blocks") => void | undefined;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
change: (range: {
displayMin: number;
displayMax: number;
}) => any;
}, string, PublicProps, Readonly<__VLS_Props_3> & Readonly<{
onChange?: ((range: {
displayMin: number;
displayMax: number;
}) => any) | undefined;
}>, {
precision: number;
title: string;
legendMode: "gradient" | "blocks";
}, {}, {}, {}, string, ComponentProvideOptions, false, {
host: HTMLDivElement;
}, HTMLDivElement>;

declare interface GridLabel {
    lon: number;
    lat: number;
    text: string;
}

export declare interface GridLayerVisibility {
    choropleth: boolean;
    grid: boolean;
    labels: boolean;
}

export declare interface GridMapOptions {
    /** 外部 OpenLayers Map，色斑图与标注图层叠加其上 */
    map: default_2;
    /** 网格 JSON 地址（与 data 二选一） */
    dataUrl?: string;
    /** 内存中的网格 JSON（与 dataUrl 二选一） */
    data?: ArrayDataJson;
    showChoropleth?: boolean;
    showGrid?: boolean;
    showLabels?: boolean;
    choroplethOpacity?: number;
    choroplethZIndex?: number;
    labelsZIndex?: number;
    labelDistance?: number;
    labelPrecision?: number;
    labelFontSize?: number;
    colorRamp?: ColorRampItem[];
    /** 图例刻度数值（不规则间隔）；不传则从 colorRamp 提取 */
    legendTicks?: number[];
    /** 图例 min（默认取数据统计 min） */
    legendMin?: number;
    /** 图例 max（默认取数据统计 max） */
    legendMax?: number;
    /** 色斑显示区间 min（默认等于 legendMin） */
    displayMin?: number;
    /** 色斑显示区间 max（默认等于 legendMax） */
    displayMax?: number;
    /** 挂载后自动 fit 到数据范围，默认 true */
    autoFit?: boolean;
    fitPadding?: number | [number, number, number, number];
    fitMaxZoom?: number;
    /** 鼠标移动拾取回调；传入则在 create 时自动绑定 pointermove */
    onPointerMove?: (event: GridMapPointerEvent) => void;
}

export declare interface GridMapPointerEvent {
    lon: number;
    lat: number;
    value: number | null;
    zoom: number;
    lod: number;
}

export declare interface GridMapStats {
    min: number;
    max: number;
}

/**
 * 网格图层控制器：叠加在外部 ol/Map 上，不创建 Map / 底图。
 */
declare class GridMapView implements GridMapViewApi {
    private fitOpts;
    readonly map: default_2;
    readonly loader: ArrayDataLoader;
    readonly choroplethLayer: ChoroplethLayer;
    readonly gridValueLayer: GridValueLayer;
    readonly stats: {
        min: number;
        max: number;
    };
    private pointerHandler;
    private pointerUnbind;
    private destroyed;
    private constructor();
    get projection(): ProjCode;
    static create(options: GridMapOptions): Promise<GridMapView>;
    /** 拾取 lon/lat 处格点值；超出数据范围或 displayRange 时返回 null */
    getValueAt(lon: number, lat: number): number | null;
    private pickValue;
    onPointerMove(handler: (ev: GridMapPointerEvent) => void): () => void;
    refreshView(): void;
    getLayerVisibility(): GridLayerVisibility;
    setLayerVisibility(visibility: Partial<GridLayerVisibility>): void;
    setShowChoropleth(visible: boolean): void;
    setShowGrid(visible: boolean): void;
    setShowLabels(visible: boolean): void;
    getLegendRange(): LegendRange;
    setLegendRange(min: number, max: number): void;
    setColorRamp(colorRamp: ColorRampItem[]): void;
    getColorRamp(): ColorRampItem[];
    getDisplayRange(): DisplayRange;
    setDisplayRange(min: number, max: number): void;
    fitToData(): void;
    getLodStep(): number;
    destroy(): void;
}

export declare interface GridMapViewApi {
    readonly map: default_2;
    readonly loader: ArrayDataLoader;
    readonly choroplethLayer: ChoroplethLayer;
    readonly gridValueLayer: GridValueLayer;
    readonly projection: ProjCode;
    readonly stats: GridMapStats;
    getLayerVisibility(): GridLayerVisibility;
    setLayerVisibility(visibility: Partial<GridLayerVisibility>): void;
    setShowChoropleth(visible: boolean): void;
    setShowGrid(visible: boolean): void;
    setShowLabels(visible: boolean): void;
    getLegendRange(): LegendRange;
    setLegendRange(min: number, max: number): void;
    setColorRamp(colorRamp: ColorRampItem[]): void;
    getColorRamp(): ColorRampItem[];
    getDisplayRange(): DisplayRange;
    setDisplayRange(min: number, max: number): void;
    refreshView(): void;
    fitToData(): void;
    getValueAt(lon: number, lat: number): number | null;
    getLodStep(): number;
    /** 绑定 map pointermove，返回当前鼠标位置格点值 */
    onPointerMove(handler: (ev: GridMapPointerEvent) => void): () => void;
    destroy(): void;
}

declare interface GridTile {
    data: Float32Array;
    width: number;
    height: number;
    bbox: [number, number, number, number];
    resolution: [number, number];
    lodLevel: number;
    lodStep: number;
}

/**
 * Canvas2D 格点数值标注
 * computeLabels → extent 转屏幕像素 → fillText（稳定可读）
 */
declare class GridValueLayer extends default_3<default_4> {
    private loader;
    private mapRef;
    private canvas;
    private labels;
    private fetchVersion;
    private viewUnbind;
    private readonly onMapChange;
    private opts;
    constructor(options: GridValueLayerOptions);
    attachMap(map: default_2): void;
    /** 切换投影后重新绑定 View 监听 */
    reattachView(map: default_2): void;
    private bindView;
    refreshData(): void;
    private scheduleFetch;
    private renderFrame;
}

declare interface GridValueLayerOptions {
    loader: ArrayDataLoader;
    distance?: number;
    precision?: number;
    fontSize?: number;
    color?: string;
    zIndex?: number;
}

/** 插槽内控制色斑 / 网格 / 标注显隐的 API */
export declare interface LayerControlApi {
    getVisibility: () => GridLayerVisibility | null;
    setLayerVisibility: (visibility: Partial<GridLayerVisibility>) => void;
    setShowChoropleth: (visible: boolean) => void;
    setShowGrid: (visible: boolean) => void;
    setShowLabels: (visible: boolean) => void;
    toggleChoropleth: () => void;
    toggleGrid: () => void;
    toggleLabels: () => void;
}

declare type LegendDisplayMode = "gradient" | "blocks";

export declare type LegendPanelPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "custom";

export declare interface LegendPanelStyle {
    background?: string;
    width?: string | number;
    padding?: string;
    borderRadius?: string;
    boxShadow?: string;
    zIndex?: number;
    bottom?: string | number;
    right?: string | number;
    left?: string | number;
    top?: string | number;
    font?: string;
}

export declare interface LegendRange {
    min: number;
    max: number;
}

declare interface LegendRange_2 {
    min: number;
    max: number;
}

/**
 * 图例双滑块：色带/色块均匀分布，数值标注紧贴色带下方。
 */
declare class LegendRangeSlider {
    private root;
    private body;
    private track;
    private bar;
    private blocks;
    private labelsRow;
    private maskLeft;
    private maskRight;
    private thumbMin;
    private thumbMax;
    private legendMin;
    private legendMax;
    private displayMin;
    private displayMax;
    private colorRamp;
    private legendTicks;
    private legendMode;
    private precision;
    private showTitle;
    private onChange?;
    private dragging;
    private onPointerMove;
    private onPointerUp;
    constructor(options: LegendRangeSliderOptions);
    private createThumb;
    /** 均匀布局位置 */
    private evenPct;
    private evenPctByIndex;
    private fmt;
    private updateBar;
    private rebuildLabels;
    private applyDisplayRange;
    setLegendMode(mode: LegendDisplayMode): void;
    getLegendMode(): LegendDisplayMode;
    setColorRamp(colorRamp: ColorRampItem[], legendTicks?: number[]): void;
    setLegendTicks(ticks: number[]): void;
    getLegendTicks(): number[];
    setDisplayRange(min: number, max: number, silent?: boolean): void;
    getDisplayRange(): {
        displayMin: number;
        displayMax: number;
    };
    getLegendRange(): {
        min: number;
        max: number;
    };
    destroy(): void;
}

declare interface LegendRangeSliderOptions {
    container: HTMLElement;
    colorRamp: ColorRampItem[];
    legendTicks?: number[];
    legendMode?: LegendDisplayMode;
    displayMin?: number;
    displayMax?: number;
    precision?: number;
    /** 是否显示内置标题（面板模式下由外部控制） */
    showTitle?: boolean;
    onChange?: (range: {
        displayMin: number;
        displayMax: number;
    }) => void;
}

declare type ProjCode = "EPSG:4326" | "EPSG:3857";

export { }
