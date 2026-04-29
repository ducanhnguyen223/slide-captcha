import { _ as __nuxt_component_0 } from "./nuxt-link-xOuiLCrr.js";
import { mergeProps, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "../server.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/ufo/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/defu/dist/defu.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/m/Documents/Project/Captcha/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/unctx/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/h3/dist/index.mjs";
import "vue-router";
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "landing" }, _attrs))} data-v-9cb5aed4><header class="header" data-v-9cb5aed4><h1 data-v-9cb5aed4>SlideCAPTCHA</h1><p class="tagline" data-v-9cb5aed4>User-friendly sliding puzzle CAPTCHA</p></header><main class="main" data-v-9cb5aed4><section class="hero" data-v-9cb5aed4><div class="hero-content" data-v-9cb5aed4><h2 data-v-9cb5aed4>Fun &amp; Secure CAPTCHA</h2><p data-v-9cb5aed4>Replace boring text CAPTCHAs with engaging sliding puzzles that users actually enjoy.</p><div class="cta-buttons" data-v-9cb5aed4>`);
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/demo",
    class: "btn btn-primary"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Try Demo`);
      } else {
        return [
          createTextVNode("Try Demo")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(ssrRenderComponent(_component_NuxtLink, {
    to: "/dashboard",
    class: "btn btn-secondary"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`View Stats`);
      } else {
        return [
          createTextVNode("View Stats")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div></div></section><section class="features" data-v-9cb5aed4><div class="feature" data-v-9cb5aed4><h3 data-v-9cb5aed4>Anti-Bot Protection</h3><p data-v-9cb5aed4>Advanced behavior analysis detects automated scripts with 99%+ accuracy.</p></div><div class="feature" data-v-9cb5aed4><h3 data-v-9cb5aed4>User Friendly</h3><p data-v-9cb5aed4>Fun puzzles instead of distorted text. Better user experience.</p></div><div class="feature" data-v-9cb5aed4><h3 data-v-9cb5aed4>Easy Integration</h3><p data-v-9cb5aed4>Simple API to integrate into any website or application.</p></div></section></main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-9cb5aed4"]]);
export {
  index as default
};
//# sourceMappingURL=index-D_aT_fcg.js.map
