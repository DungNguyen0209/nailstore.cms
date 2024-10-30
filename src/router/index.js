import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    name: 'dashboard-home',
    path: '/',
    component: () => import('../layout/Master.vue'),
    redirect: '/dashboard',
    children: [{
      name: 'dashboard',
      path: '/dashboard',
      component: () => import('../components/Dashboard.vue'),

    }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;