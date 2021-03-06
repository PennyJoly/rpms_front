import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
//注释掉mock传入真实数据
// import Mock from './mock'
// Mock.bootstrap();
import BaiduMap from 'vue-baidu-map'
import 'font-awesome/css/font-awesome.min.css'
import axios from 'axios'

//配置axios的全局基本路径
axios.defaults.baseURL='http://localhost/';
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios;



Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(BaiduMap,{
  // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
  ak: 'Hfr6TfnXRMrg1Df5P2VjwORlDrR8BvTR'
})
const router = new VueRouter({
  routes:routes
});

router.$addRoutes = (params) => {
  router.matcher = new VueRouter({mode: 'history'}).matcher;
  router.addRoutes(params)
}
//动态路由
let dynamicRouter = {
  routes
}

var getRouter //用来获取后台拿到的路由

let newRoutes = null;

router.beforeEach((to, from, next) => {
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
  //不加这个判断，路由会陷入死循环
  if (!newRoutes) {
    // if (!getObjArr('router')) {
    axios.post('/menu/permission').then(res => {
      //后台拿到路由
      getRouter = res.data;

      let pMenu=eval(getRouter);
      for (let i = 0; i < pMenu.length; i++) {
        let value = pMenu[i].component;
        pMenu[i].component = function component(resolve) {
          console.log("---------11111111-----"+resolve);
          console.log(value);
          require([""+value], resolve);
        };
        let cMenu=pMenu[i].children;
        if (cMenu!=null&&cMenu.length > 0) {
          for (let j = 0; j < cMenu.length; j++) {
            let value1 = cMenu[j].component;
            cMenu[j].component = function component(resolve1) {
              console.log("---------2222222222-----"+resolve1);
              console.log(value1);
              require([""+value1], resolve1);
            };
          }
        }
        // 重要：添加至动态路由
        dynamicRouter.routes.splice(i+1,0,pMenu[i]);
        router.$addRoutes(dynamicRouter.routes)
        newRoutes = dynamicRouter.routes;
        next({ ...to, replace: true })
      }
    })
  } else {
    next()
  }
});

axios.interceptors.request.use(config=>{
  if (sessionStorage.getItem('token')){
    //让每个请求头带[X-TOKEN]
    config.headers['X-TOKEN'] = sessionStorage.getItem('token');
  }
  return config;
},error => {
  Promise.reject(error);
});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

