import { _ as __nuxt_component_0 } from "./nuxt-link-xOuiLCrr.js";
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "../server.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/ufo/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/defu/dist/defu.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/m/Documents/Project/Captcha/node_modules/nuxt/node_modules/hookable/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/unctx/dist/index.mjs";
import "/Users/m/Documents/Project/Captcha/node_modules/h3/dist/index.mjs";
import "vue-router";
const GRID_SIZE = 300;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SlidingCaptcha",
  __ssrInlineRender: true,
  setup(__props) {
    ref("");
    const imageUrl = ref("");
    const currentGrid = ref([]);
    const solutionGrid = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];
    ref(false);
    ref(null);
    ref({ x: 0, y: 0 });
    ref([]);
    ref(0);
    const verifying = ref(false);
    const result = ref(null);
    const CELL_SIZE = GRID_SIZE / 3;
    function getCellStyle(row, col) {
      return {
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        left: `${col * CELL_SIZE}px`,
        top: `${row * CELL_SIZE}px`,
        backgroundImage: imageUrl.value ? `url(${imageUrl.value})` : "none",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        backgroundPosition: `-${col * CELL_SIZE}px -${row * CELL_SIZE}px`
      };
    }
    const canVerify = computed(() => {
      return JSON.stringify(currentGrid.value) === JSON.stringify(solutionGrid);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "captcha-container" }, _attrs))} data-v-48eb9a34><div class="puzzle-grid" data-v-48eb9a34><!--[-->`);
      ssrRenderList(unref(currentGrid), (row, rowIndex) => {
        _push(`<div class="puzzle-row" data-v-48eb9a34><!--[-->`);
        ssrRenderList(row, (cell, colIndex) => {
          _push(`<div class="${ssrRenderClass([{ "empty": cell === 0 }, "puzzle-cell"])}" style="${ssrRenderStyle(getCellStyle(rowIndex, colIndex))}" data-v-48eb9a34></div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]--></div><div class="controls" data-v-48eb9a34><button${ssrIncludeBooleanAttr(!unref(canVerify) || unref(verifying)) ? " disabled" : ""} class="btn-verify" data-v-48eb9a34>${ssrInterpolate(unref(verifying) ? "Verifying..." : "Verify")}</button><button class="btn-reset" data-v-48eb9a34>New Puzzle</button></div>`);
      if (unref(result)) {
        _push(`<div class="${ssrRenderClass(["result", unref(result).success ? "success" : "error"])}" data-v-48eb9a34>`);
        if (unref(result).success) {
          _push(`<p data-v-48eb9a34>✓ Verified! Token: ${ssrInterpolate(unref(result).token?.substring(0, 20))}...</p>`);
        } else {
          _push(`<p data-v-48eb9a34>✗ ${ssrInterpolate(unref(result).reason || "Verification failed")}</p>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SlidingCaptcha.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SlidingCaptcha = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-48eb9a34"]]);
const _sfc_main = {
  __name: "demo",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "demo-page" }, _attrs))} data-v-9f6d7e8d><header class="header" data-v-9f6d7e8d>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "back-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Back`);
          } else {
            return [
              createTextVNode("← Back")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 data-v-9f6d7e8d>Demo</h1></header><main class="main" data-v-9f6d7e8d><p class="instructions" data-v-9f6d7e8d>Slide the puzzle pieces to restore the image</p>`);
      _push(ssrRenderComponent(SlidingCaptcha, null, null, _parent));
      _push(`</main></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/demo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const demo = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9f6d7e8d"]]);
export {
  demo as default
};
//# sourceMappingURL=demo-D6Ci8Crt.js.map
