import { default as default_2 } from 'ol/layer/Image';
import { default as default_3 } from 'ol/source/ImageCanvas';
import { default as default_4 } from 'ol/Map';

/** 与 arrayData.json 一致的网格数据格式 */
export declare interface ArrayDataJson {
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
export declare class ArrayDataLoader {
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

/** 纯函数：Worker 与主线程共享的网格数据处理 */
export declare interface ArrayDataMeta {
    startLat: number;
    endLat: number;
    startLon: number;
    endLon: number;
    latStep: number;
    lonStep: number;
    latCount: number;
    lonCount: number;
}

/** 256×1 连续色带（LINEAR），避免低值 NEAREST 采到透明 */
export declare function buildLegendTexture(gl: WebGL2RenderingContext, colorRamp: ColorRampItem[]): LegendTexture;

export declare class ChoroplethLayer extends default_2<default_3> {
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
    attachMap(map: default_4): void;
    reattachView(map: default_4): void;
    private bindView;
    getDataValue(lon: number, lat: number): number | null;
    dispose(): void;
}

export declare interface ChoroplethLayerOptions {
    loader: ArrayDataLoader;
    colorRamp?: ColorRampItem[];
    opacity?: number;
    showGrid?: boolean;
    zIndex?: number;
}

export declare type ColorRampItem = [number, [number, number, number, number]];

/** 按新 min/max 重采样色带（保留各 stop 相对位置） */
export declare function colorRampWithRange(min: number, max: number, template?: ColorRampItem[]): ColorRampItem[];

export declare function createGridMap(options: GridMapOptions): Promise<GridMapView>;

export declare const createGridOverlay: typeof createGridMap;

export declare function createLayerControlApi(overlay: GridMapView | null | undefined): LayerControlApi;

export declare function createLegendPanel(options: LegendPanelOptions): LegendPanel;

export declare function createLegendRangeSlider(options: LegendRangeSliderOptions): LegendRangeSlider;

/** 4326 数据 bbox → 视图投影 extent */
export declare function dataBboxToViewExtent(bbox4326: [number, number, number, number], projCode: string): [number, number, number, number];

export declare const DEFAULT_LEGEND_PANEL_STYLE: Required<Pick<LegendPanelStyle, "background" | "width" | "padding" | "borderRadius" | "boxShadow" | "zIndex">>;

/** 标准色斑色带：min 起可见浅绿，低值（0~3）也能渲染 */
export declare function defaultGridColorRamp(min: number, max: number): ColorRampItem[];

export declare function defaultTemperatureRamp(min: number, max: number): ColorRampItem[];

export declare interface DisplayRange {
    min: number;
    max: number;
}

/** 均匀图例位置 → 数值 */
export declare function evenLegendPercentToValue(p: number, ticks: number[]): number;

/** 从色带提取图例刻度（支持不规则间隔） */
export declare function extractLegendTicks(colorRamp: ColorRampItem[]): number[];

export declare function getInnerRampStops(colorRamp: ColorRampItem[]): ColorRampItem[];

export declare interface GridLabel {
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
    map: default_4;
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
export declare class GridMapView implements GridMapViewApi {
    private fitOpts;
    readonly map: default_4;
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
    readonly map: default_4;
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

export declare interface GridTile {
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
export declare class GridValueLayer extends default_2<default_3> {
    private loader;
    private mapRef;
    private canvas;
    private labels;
    private fetchVersion;
    private viewUnbind;
    private readonly onMapChange;
    private opts;
    constructor(options: GridValueLayerOptions);
    attachMap(map: default_4): void;
    /** 切换投影后重新绑定 View 监听 */
    reattachView(map: default_4): void;
    private bindView;
    refreshData(): void;
    private scheduleFetch;
    private renderFrame;
}

export declare interface GridValueLayerOptions {
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

export declare const LEGEND_PANEL_PLACEMENT_STYLE: Record<Exclude<LegendPanelPlacement, "custom">, Pick<LegendPanelStyle, "bottom" | "right" | "left" | "top">>;

export declare type LegendDisplayMode = "gradient" | "blocks";

export declare class LegendPanel {
    readonly element: HTMLElement;
    readonly sliderHost: HTMLElement;
    readonly controlsSlot: HTMLElement;
    readonly slider: LegendRangeSlider;
    private titleEl;
    private overlayOnChange?;
    constructor(options: LegendPanelOptions);
    bindOverlay(overlay: GridMapView): void;
    setTitle(title: string): void;
    applyStyle(style: LegendPanelStyle, placement?: LegendPanelPlacement): void;
    setLegendMode(mode: LegendDisplayMode): void;
    destroy(): void;
}

export declare interface LegendPanelOptions {
    parent?: HTMLElement | string;
    placement?: LegendPanelPlacement;
    style?: LegendPanelStyle;
    title?: string;
    showTitle?: boolean;
    colorRamp: ColorRampItem[];
    legendTicks?: number[];
    legendMode?: LegendDisplayMode;
    displayMin?: number;
    displayMax?: number;
    precision?: number;
    onChange?: (range: {
        displayMin: number;
        displayMax: number;
    }) => void;
    controlsSlot?: HTMLElement;
}

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

export declare function legendRangeFromRamp(colorRamp: ColorRampItem[]): {
    min: number;
    max: number;
};

/**
 * 图例双滑块：色带/色块均匀分布，数值标注紧贴色带下方。
 */
export declare class LegendRangeSlider {
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

export declare interface LegendRangeSliderOptions {
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

declare interface LegendTexture {
    texture: WebGLTexture;
    min: number;
    max: number;
    width: number;
}

/** 经纬度 → 地图视图投影坐标 */
export declare function lonLatToMapCoord(lon: number, lat: number, projCode: string): [number, number];

/** 地图视图投影坐标 → 经纬度 */
export declare function mapCoordToLonLat(x: number, y: number, projCode: string): [number, number];

export declare type ProjCode = "EPSG:4326" | "EPSG:3857";

export declare function rampToCssGradient(colorRamp: ColorRampItem[]): string;

/** 均匀分布的 CSS 渐变色带 */
export declare function rampToEvenCssGradient(colorRamp: ColorRampItem[]): string;

export declare function resolveLegendPanelStyle(placement?: LegendPanelPlacement, style?: LegendPanelStyle): Record<string, string | number>;

export declare function rgbaToCss(rgba: [number, number, number, number]): string;

/** 刻度序号 → 均匀位置 [0,1] */
export declare function tickIndexToEvenPercent(index: number, tickCount: number): number;

/** 数值 → 均匀图例位置（段内按数值插值，段宽相等） */
export declare function valueToEvenLegendPercent(value: number, ticks: number[]): number;

/** 数值在图例条上的位置比例 [0,1]（按实际数值线性映射） */
export declare function valueToLegendPercent(value: number, colorRamp: ColorRampItem[]): number;

/** 视图 extent → 4326（供 Worker / 数据查询） */
export declare function viewExtentTo4326(extent: number[], projCode: string): [number, number, number, number];

export { }
