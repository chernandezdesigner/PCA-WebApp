import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import AssessmentReportView from '@/views/AssessmentReportView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false },
    },
    {
      // Full assessment report (Sections 5-9)
      path: '/assessment/:id/report',
      name: 'assessment-report',
      component: AssessmentReportView,
      meta: { requiresAuth: true },
    },
    {
      // Demo route for testing without auth
      path: '/demo/report',
      name: 'assessment-report-demo',
      component: AssessmentReportView,
      meta: { requiresAuth: false },
    },
    {
      // Legacy route redirect
      path: '/demo/building-envelope',
      redirect: '/demo/report',
    },
    {
      // Legacy route redirect
      path: '/assessment/:id/building-envelope',
      redirect: to => `/assessment/${to.params.id}/report`,
    },
  ],
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.user) {
    // Redirect to login if route requires auth and user is not logged in
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else if (to.path === '/login' && authStore.user) {
    // Redirect to home if user is already logged in and tries to access login
    next('/');
  } else {
    next();
  }
});

export default router;
