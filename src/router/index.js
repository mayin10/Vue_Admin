import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Welcome from '../views/Welcome.vue'

import Menu from '../views/nav/Menu.vue'
import Auth from '../views/nav/Auth.vue'
import Role from '../views/nav/Role.vue'

import Admin from '../views/user/Admin.vue'
import User from '../views/user/User.vue'
import Address from '../views/user/Address.vue'
import Shop from '../views/user/Shop.vue'
import MyShop from '../views/user/MyShop.vue'


import Brand from '../views/goods/Brand.vue'
import Type from '../views/goods/Type.vue'
import Group from '../views/goods/Group.vue'
import Params from '../views/goods/Params.vue'
import Tags from '../views/goods/Tags.vue'
import GoodsList from '../views/goods/GoodsList.vue'
import GoodsAdd from '../views/goods/GoodsAdd.vue'
import GoodsEdit from '../views/goods/GoodsEdit.vue'
import GoodsSpec from '../views/goods/GoodsSpec.vue'

import AllOrder from '../views/order/AllOrder.vue'
import PayOrder from '../views/order/PayOrder.vue'
import ShipOrder from '../views/order/ShipOrder.vue'
import CancelOrder from '../views/order/CancelOrder.vue'

import ReportsUser from '../views/report/reportUser.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },

        { path: '/auth', component: Auth},
        { path: '/menu', component: Menu},
        { path: '/role', component: Role},

        { path: '/admin', component: Admin},
        { path: '/user', component: User},
        { path: '/address', component: Address},
        { path: '/shop', component: Shop},
        { path: '/myshop', component: MyShop},

        { path: '/brand', component: Brand},
        { path: '/type', component: Type},
        { path: '/group', component: Group},
        { path: '/params', component: Params},
        { path: '/tags', component: Tags},
        { path: '/goodsList', component: GoodsList},
        { path: '/goodsAdd', component: GoodsAdd},
        { path: '/goodsEdit', component: GoodsEdit},
        { path: '/goodsSpec', component: GoodsSpec},

        { path: '/order', component: AllOrder},
        { path: '/payOrder', component: PayOrder},
        { path: '/shipOrder', component: ShipOrder},
        { path: '/cancelOrder', component: CancelOrder},

        { path: '/reportUser', component: ReportsUser},
      ]

  }
]

const router = new VueRouter({
  routes
})


// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()  放行    next('/login')  强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
