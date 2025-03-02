import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth.js'
import Style from '@/views/StyleView.vue'

const routes = [
  {
    meta: {
      title: 'Select style'
    },
    path: '/style',
    name: 'style',
    component: Style
  },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Dashboard'
    },
    path: '/',
    name: 'dashboard',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Checkin'
    },
    path: '/checkin-customer',
    name: 'checkin',
    component: () => import('@/views/CheckinCustomer.vue')
  },
  {
    meta: {
      title: 'CheckinInfo'
    },
    path: '/checkin-customer-info',
    name: 'checkinInfo',
    component: () => import('@//views/CheckinCustomerInfo.vue')
  },
  {
    meta: {
      title: 'CheckinSucess'
    },
    path: '/checkin-customer-sucess',
    name: 'CheckinSucess',
    component: () => import('@//views/CheckInSuccess.vue'),
    props: true
  },
  {
    meta: {
      title: 'Services'
    },
    path: '/services',
    name: 'services',
    component: () => import('@/views/ServiceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Orders'
    },
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/OrderView.vue'),
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Customers'
    },
    path: '/customers',
    name: 'customers',
    component: () => import('@/views/CustomerView.vue'),
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Accounts'
    },
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountView.vue'),
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Settings'
    },
    path: '/setting',
    name: 'setting',
    component: () => import('@/views/SettingView.vue'),
    meta: { requiresAuth: true }
  },
  // {
  //   meta: {
  //     title: 'Promotion'
  //   },
  //   path: '/promotion',
  //   name: 'promotion',
  //   component: () => import('@/views/PromotionView.vue'),
  //   meta: { requiresAuth: true }
  // },
  {
    meta: {
      title: 'Credit Point'
    },
    path: '/creditPoint',
    name: 'creditPoint',
    component: () => import('@/views/CreditPointView.vue'),
    meta: { requiresAuth: true }
  },
  {
    meta: {
      title: 'Tables'
    },
    path: '/tables',
    name: 'tables',
    component: () => import('@/views/TablesView.vue')
  },
  {
    meta: {
      title: 'Forms'
    },
    path: '/forms',
    name: 'forms',
    component: () => import('@/views/FormsView.vue')
  },
  {
    meta: {
      title: 'Profile'
    },
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue')
  },
  {
    meta: {
      title: 'Ui'
    },
    path: '/ui',
    name: 'ui',
    component: () => import('@/views/UiView.vue')
  },
  {
    meta: {
      title: 'Responsive layout'
    },
    path: '/responsive',
    name: 'responsive',
    component: () => import('@/views/ResponsiveView.vue')
  },
  {
    meta: {
      title: 'Login'
    },
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    meta: {
      title: 'Error'
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isTokenValid()) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (authStore.isRefreshTokenValid() && (await authStore.getRefreshToken())) {
      return true
    }
    return {
      path: '/login',
      // save the location we were at to come back later
      query: { redirect: to.fullPath }
    }
  }
})

export default router
