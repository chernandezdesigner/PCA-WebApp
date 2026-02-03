import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import AssessmentView from '@/views/AssessmentView.vue';
import BuildingEnvelopeView from '@/views/BuildingEnvelopeView.vue';

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
      path: '/assessment/:id',
      name: 'assessment',
      component: AssessmentView,
      meta: { requiresAuth: true },
    },
    {
      path: '/assessment/:id/building-envelope',
      name: 'building-envelope',
      component: BuildingEnvelopeView,
      meta: { requiresAuth: true },
    },
    {
      // Demo route for testing without auth
      path: '/demo/building-envelope',
      name: 'building-envelope-demo',
      component: BuildingEnvelopeView,
      meta: { requiresAuth: false },
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
