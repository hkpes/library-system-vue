import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import locale from 'element-ui/lib/locale/lang/zh-TW'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
// 清空表單
import resetForm from '@/utils/resetForm'

Vue.prototype.$resetForm = resetForm
// 信息提示框 
import myconfirm from '@/utils/myconfirm'

Vue.prototype.$myconfirm = myconfirm
// 對象快速複製
import objCoppy from '@/utils/objCoppy'

Vue.prototype.$objCoppy = objCoppy

// 表格穿梭框 
import eltTransfer from 'elt-transfer'

Vue.use(eltTransfer)

// 權限框架註冊全局
import permission from '@/permission/index.js' // 權限判斷指令
Vue.use(permission)
import * as echarts from 'echarts'

Vue.prototype.$echarts = echarts
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
