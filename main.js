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
import { setup } from './index'

export function createApp() {
  const app = createSSRApp(App)
  setup([Config.app], {})
  return {
    app: app
  }
}
// #endif