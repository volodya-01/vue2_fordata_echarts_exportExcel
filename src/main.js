// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import echarts from 'echarts'
import axios from 'axios'
import moment from 'moment'//导入文件


Vue.config.productionTip = false
Vue.prototype.$echarts = echarts
Vue.prototype.$axios = axios;
Vue.prototype.$moment = moment;//赋值使用
import Blob from './excel/Blob'
import Export2Excel from './excel/Export2Excel.js'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
