export const TEXT_VS = `#version 300 es
in vec2 a_quad;
in vec2 a_screen_xy;
in vec2 a_char_offset;
in vec4 a_atlas_rect;
in vec2 a_glyph_size;

uniform vec2 u_size;
uniform float u_font_size;
uniform float u_atlas_font_size;

out vec2 v_atlas_uv;

void main() {
  float scale = u_font_size / u_atlas_font_size;
  vec2 charCenter = a_screen_xy + a_char_offset * scale;
  vec2 quadPx = a_glyph_size * scale;
  vec2 pos = charCenter + a_quad * quadPx * 0.5;
  vec2 ndc = vec2(pos.x / u_size.x * 2.0 - 1.0, 1.0 - pos.y / u_size.y * 2.0);
  gl_Position = vec4(ndc, 0.0, 1.0);
  vec2 uvLocal = a_quad * 0.5 + 0.5;
  v_atlas_uv = a_atlas_rect.xy + uvLocal * a_atlas_rect.zw;
}
`

export const TEXT_FS = `#version 300 es
precision highp float;
in vec2 v_atlas_uv;
out vec4 fragColor;

uniform sampler2D u_atlas;
uniform vec4 u_color;

void main() {
  float sd = texture(u_atlas, v_atlas_uv).a;
  const float SDF_EDGE = 0.73;
  float gamma = max(fwidth(sd) * 0.5, 0.04);
  float alpha = smoothstep(SDF_EDGE - gamma, SDF_EDGE + gamma, sd);
  if (alpha < 0.1) discard;
  fragColor = vec4(u_color.rgb, alpha * u_color.a);
}
`
