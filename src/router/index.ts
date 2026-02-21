import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import HomeView from '@/views/HomeView.vue';
import AssessmentReportView from '@/views/AssessmentReportView.vue';
import PdfPreviewView from '@/views/PdfPreviewView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      // Legacy home route - redirects to dashboard
      path: '/home',
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
      // Report editor - main route for editing reports
      path: '/report/:id',
      name: 'report-editor',
      component: AssessmentReportView,
      meta: { requiresAuth: true },
    },
    {
      // Legacy route - redirect to new report route
      path: '/assessment/:id/report',
      name: 'assessment-report',
      redirect: to => `/report/${to.params.id}`,
    },
    {
      // Demo route for testing without auth
      path: '/demo/report',
      name: 'report-demo',
      component: AssessmentReportView,
      meta: { requiresAuth: false },
    },
    {
      path: '/report/:id/pdf-preview',
      name: 'pdf-preview',
      component: PdfPreviewView,
      meta: { requiresAuth: true },
    },
    {
      path: '/demo/pdf-preview',
      name: 'pdf-preview-demo',
      component: PdfPreviewView,
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
      redirect: to => `/report/${to.params.id}`,
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
