import { createApp, type App as VueApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createI18n } from 'vue-i18n'
import VueExampleComponent from '@/components/VueExampleComponent.vue'
import en from '../locales/en/main.json'
import zh from '../locales/zh/main.json'

// @ts-ignore - ComfyUI external module
import { app } from '../../../scripts/app.js'

const vueApps = new Map<number, VueApp>()

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, zh }
})

// @ts-ignore
function createVueWidget(node) {
  const container = document.createElement('div')
  container.id = `vue-basic-widget-${node.id}`
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.minHeight = '400px'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.overflow = 'hidden'

  const widget = node.addDOMWidget(
    'custom_vue_component_basic',
    'vue-basic',
    container,
    {
      getMinHeight: () => 420,
      hideOnZoom: false,
      serialize: true
    }
  )

  const vueApp = createApp(VueExampleComponent, {
    widget,
    node
  })

  vueApp.use(i18n)
  vueApp.use(PrimeVue)

  vueApp.mount(container)
  vueApps.set(node.id, vueApp)

  widget.onRemove = () => {
    const vueApp = vueApps.get(node.id)
    if (vueApp) {
      vueApp.unmount()
      vueApps.delete(node.id)
    }
  }

  return { widget }
}

app.registerExtension({
  name: 'vue-basic',

  settings: [
    {
      id: 'Comfy.Frontend.VueBasic.ExampleSetting',
      category: ['Example', 'VueBasic', 'Example'],
      name: 'Vue Basic Example Setting',
      tooltip: 'An example setting for the Vue Basic extension',
      type: 'boolean',
      defaultValue: true,
      experimental: true
    }
  ],

  getCustomWidgets() {
    return {
      // @ts-ignore
      CUSTOM_VUE_COMPONENT_BASIC(node) {
        return createVueWidget(node)
      }
    }
  },

  // @ts-ignore
  nodeCreated(node) {
    if (node.constructor?.comfyClass !== 'vue-basic') return

    const [oldWidth, oldHeight] = node.size

    node.setSize([Math.max(oldWidth, 300), Math.max(oldHeight, 520)])
  },

  setup() {
    console.log("main setup--------");
    const search: string = window.location.search; // "?foo=bar&baz=1"
    const params: Record<string, string> = {};
    if (search) {
      search.slice(1).split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value || '');
      });
    }
    // 打印工作流json文件名称
    console.log("main setup params--------");
    console.log(params.workFlowJson);

    app.graph.clear();
    app.graph.fromJSON(
      String.raw`{"3":{"inputs":{"seed":582234404284254,"steps":30,"cfg":4,"sampler_name":"euler","scheduler":"normal","denoise":1,"model":["66",0],"positive":["6",0],"negative":["7",0],"latent_image":["58",0]},"class_type":"KSampler","_meta":{"title":"K采样器"}},"6":{"inputs":{"text":"3D通用风格,一块立体金色矩形卡片,四角带铆钉装饰,中央浮雕字体设计“发财”字样,表面光滑反光,白色背景","clip":["38",0]},"class_type":"CLIPTextEncode","_meta":{"title":"Positive Prompt"}},"7":{"inputs":{"text":"ng_deepnegative_v1_75t,(badhandv4:1.2),EasyNegative,(worst quality:2),","clip":["38",0]},"class_type":"CLIPTextEncode","_meta":{"title":"Negative Prompt"}},"8":{"inputs":{"samples":["3",0],"vae":["39",0]},"class_type":"VAEDecode","_meta":{"title":"VAE解码"}},"37":{"inputs":{"unet_name":"qwen_image_fp8_e4m3fn.safetensors","weight_dtype":"fp8_e4m3fn"},"class_type":"UNETLoader","_meta":{"title":"UNet加载器"}},"38":{"inputs":{"clip_name":"qwen_2.5_vl_7b_fp8_scaled.safetensors","type":"qwen_image","device":"default"},"class_type":"CLIPLoader","_meta":{"title":"加载CLIP"}},"39":{"inputs":{"vae_name":"qwen_image_vae.safetensors"},"class_type":"VAELoader","_meta":{"title":"加载VAE"}},"58":{"inputs":{"width":1024,"height":1024,"batch_size":1},"class_type":"EmptySD3LatentImage","_meta":{"title":"空Latent图像（SD3）"}},"60":{"inputs":{"filename_prefix":"ComfyUI","images":["8",0]},"class_type":"SaveImage","_meta":{"title":"保存图像"}},"66":{"inputs":{"shift":3.1000000000000005,"model":["89",0]},"class_type":"ModelSamplingAuraFlow","_meta":{"title":"采样算法（AuraFlow）"}},"89":{"inputs":{"lora_name":"01-Qwen\3D通用风格.safetensors","strength_model":0.8,"model":["37",0]},"class_type":"LoraLoaderModelOnly","_meta":{"title":"LoRA加载器（仅模型）"}}}`
    );
    app.canvas.draw(true, true);
  }
})
