import App from './App'
import Config from './config'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { bootup } from './index'
async function createHighOrderApp() {
    const app = createSSRApp(App)
    await bootup([Config.app], {})
    return app
}

export function createApp() {
  const app = createSSRApp(App)
  bootup([Config.app], {})
  return {
    app: app
  }
}
// #endif