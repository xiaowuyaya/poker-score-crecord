import Vue from 'vue'
import App from './App'
import uView from "uview-ui";

let mpShare = require('uview-ui/libs/mixin/mpShare.js');
Vue.mixin(mpShare)

Vue.use(uView);
Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
