export const CHOROPLETH_VS = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

export const CHOROPLETH_FS = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_data;
uniform sampler2D u_legend;
uniform mat3 u_transform;
uniform vec2 u_size;
uniform vec2 u_delta;
uniform float u_pixel_ratio;
uniform vec4 u_data_bbox;   // minLon, minLat, maxLon, maxLat
uniform vec2 u_cell_size;   // LOD lonStep, latStep（数据采样）
uniform vec2 u_native_cell_size; // 原始格距
uniform vec2 u_grid_origin;   // startLon, startLat
uniform vec2 u_data_size;   // cols, rows
uniform vec2 u_legend_meta; // min, max
uniform vec2 u_display_range; // 显示区间 [min, max]，区间外格点隐藏
uniform float u_nodata;
uniform float u_opacity;
uniform float u_show_grid;
uniform float u_grid_lod;
uniform float u_proj_mercator; // 1 = EPSG:3857

vec2 mapCoordToLonLat(vec2 mapCoord) {
  if (u_proj_mercator < 0.5) return mapCoord;
  const float MAX_EXT = 20037508.342789244;
  float lon = mapCoord.x / MAX_EXT * 180.0;
  float lat = atan(exp(mapCoord.y / MAX_EXT * 3.141592653589793)) * 360.0 / 3.141592653589793 - 90.0;
  return vec2(lon, lat);
}

vec2 getLonLat(vec2 uv) {
  vec2 xy = (vec2(uv.x, 1.0 - uv.y) * u_size) / u_pixel_ratio - u_delta;
  float projX = u_transform[0][0] * xy.x + u_transform[1][0] * xy.y + u_transform[2][0];
  float projY = u_transform[0][1] * xy.x + u_transform[1][1] * xy.y + u_transform[2][1];
  return mapCoordToLonLat(vec2(projX, projY));
}

vec4 lookupLegend(float value) {
  float t = clamp((value - u_legend_meta.x) / (u_legend_meta.y - u_legend_meta.x), 0.0, 1.0);
  return texture(u_legend, vec2(t, 0.5));
}

float gridLineFactor(vec2 lonlat, vec2 cellSize, vec4 dataBbox) {
  if (u_show_grid < 0.5) return 0.0;
  float fx = fract((lonlat.x - dataBbox.x) / cellSize.x);
  float fy = fract((lonlat.y - dataBbox.y) / cellSize.y);
  float edge = min(min(fx, 1.0 - fx), min(fy, 1.0 - fy));
  float pxLon = cellSize.x / (u_data_bbox.z - u_data_bbox.x) * u_size.x / u_pixel_ratio;
  float pxLat = cellSize.y / (u_data_bbox.w - u_data_bbox.y) * u_size.y / u_pixel_ratio;
  float threshold = 1.0 / min(pxLon, pxLat);
  return 1.0 - smoothstep(0.0, threshold, edge);
}

void main() {
  vec2 lonlat = getLonLat(v_uv);

  if (lonlat.x < u_data_bbox.x || lonlat.x > u_data_bbox.z ||
      lonlat.y < u_data_bbox.y || lonlat.y > u_data_bbox.w) {
    discard;
  }

  float col = floor((lonlat.x - u_data_bbox.x) / u_cell_size.x);
  float row = floor((u_data_bbox.w - lonlat.y) / u_cell_size.y);
  col = clamp(col, 0.0, u_data_size.x - 1.0);
  row = clamp(row, 0.0, u_data_size.y - 1.0);

  vec2 texCoord = (vec2(col + 0.5, row + 0.5)) / u_data_size;
  float v = texture(u_data, texCoord).r;

  if (isnan(v) || abs(v - u_nodata) < 0.001) {
    discard;
  }

  if (v < u_display_range.x || v > u_display_range.y) {
    discard;
  }

  vec4 color = lookupLegend(v);
  if (color.a < 0.02) {
    discard;
  }

  float grid = gridLineFactor(lonlat, u_cell_size, u_data_bbox);
  vec3 rgb = mix(color.rgb, vec3(0.15, 0.15, 0.15), grid * 0.55);
  fragColor = vec4(rgb, color.a * u_opacity);
}
`
