import Vue from 'vue'
import axios from 'axios'
//配置axios的全局基本路径
axios.defaults.baseURL='http://localhost/'


let routes = [
    {
        path: '/',
        component: () => import('./views/Home'),
        name: '主页',
    },{
        path:'/login',
        component: ()=> import('./views/Login'),
        name:'登陆页面',
        hidden:true
    },{
        path:'/404',
        component: ()=> import('./views/404'),
        name:'错误页面',
        hidden:true
    }
];




export default routes;

