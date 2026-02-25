import auth from '@/router/middleware/auth.js'
import openItemBaseOnSlug from '@/router/middleware/openItemBaseOnSlug.js'

function authRoute(obj) {
  return {
    ...obj,
  }
}

export default [
  {
    name: 'home',
    path: '/',
    component: () => import('@/components/pages/dashboard/Index.vue'),
    meta: {
      middleware: auth,
    },
  },
  {
    name: 'settings',
    path: '/settings',
    meta: {
      middleware: auth,
    },
    children: [
      {
        name: 'settings.base',
        path: 'base',
        component: () => import('@/components/pages/settings/me/Index.vue'),
      },
      {
        name: 'settings.company',
        path: 'company',
        component: () =>
          import('@/components/pages/settings/company/Company.vue'),
      },
      {
        name: 'settings.users',
        path: 'users',
        component: () => import('@/components/pages/settings/users/Users.vue'),
      },
      {
        name: 'settings.roles',
        path: 'roles/:id',
        component: () => import('@/components/pages/settings/role/Index.vue'),
      },
      {
        name: 'settings.invoice-items',
        path: 'invoice/items',
        component: () =>
          import('@/components/pages/settings/invoice/Item.vue'),
      },
      {
        name: 'settings.company-info',
        path: 'billing/company',
        component: () =>
          import(
            '@/components/pages/settings/invoice/company_information/Index.vue'
          ),
      },
      {
        name: 'settings.currency',
        path: 'currency',
        component: () =>
          import('@/components/pages/settings/invoice/currency/Index.vue'),
      },
      {
        name: 'settings.mesurment-units',
        path: 'mesurment-units',
        component: () =>
          import(
            '@/components/pages/settings/invoice/mesurment_units/Index.vue'
          ),
      },
      {
        name: 'settings.notes',
        path: 'notes',
        component: () =>
          import('@/components/pages/settings/invoice/notes/Index.vue'),
      },
      {
        name: 'settings.vacation-groups',
        path: 'vacation-groups',
        component: () =>
          import('@/components/pages/settings/vacation/Index.vue'),
      },
    ],
  },
  {
    name: 'chat',
    path: '/chat',
    component: () => import('@/components/pages/chat/Index.vue'),
    meta: {
      middleware: auth,
    },
    children: [
      {
        name: 'chat-details',
        path: ':chatId/view',
        component: () => import('@/components/pages/chat/ChatDetails.vue'),
      },
    ],
  },
  {
    name: 'projects',
    path: '/projects',
    component: () => import('@/components/pages/project/Index.vue'),
  },
  {
    name: 'project-details',
    path: '/projects/:project',
    redirect: to => ({ name: 'project.board.view', params: to.params }),
    component: () => import('@/components/pages/project/View.vue'),
    children: [
      {
        name: 'project.dashboard',
        path: 'dashboard',
        component: () => import('@/components/pages/project/Dashboard.vue'),
      },
      {
        name: 'project.tasks',
        path: 'backlog',
        component: () => import('@/components/pages/project/tasks/List.vue'),
      },
      {
        name: 'project.boards',
        path: 'boards/:board?',
        component: () => import('@/components/pages/project/board/Index.vue'),
        children: [
          {
            name: 'project.board.view',
            path: 'view/:sprint?',
            component: () =>
              import('@/components/pages/project/board/view/Board.vue'),
          },
          {
            name: 'project.board.tasks',
            path: 'tasks/:sprint?',
            component: () =>
              import('@/components/pages/project/board/tasks/Index.vue'),
          },
          {
            name: 'project.board.settings',
            path: 'settings',
            component: () =>
              import('@/components/pages/project/board/settings/Index.vue'),
          },
        ],
      },
      {
        name: 'project.documents',
        path: 'documents',
        component: () =>
          import('@/components/pages/project/documents/Index.vue'),
      },
      {
        name: 'project.documents.editor',
        path: 'documents/:id',
        component: () =>
          import('@/components/pages/project/documents/Editor.vue'),
      },
      {
        name: 'project.settings',
        path: 'settings',
        component: () =>
          import('@/components/pages/project/settings/Index.vue'),
      },
    ],
  },
  {
    name: 'shared.document',
    path: '/d/:token',
    component: () => import('@/components/pages/shared/SharedDocument.vue'),
    // No auth middleware — publicly accessible
  },
  {
    name: 'shared.board',
    path: '/b/:token',
    component: () => import('@/components/pages/shared/SharedBoard.vue'),
    // No auth middleware — publicly accessible
  },
  {
    name: 'documents',
    path: '/documents',
    component: () => import('@/components/pages/documents/Index.vue'),
    meta: { middleware: auth },
  },
  {
    name: 'documents.editor',
    path: '/documents/:id',
    component: () => import('@/components/pages/documents/Editor.vue'),
    meta: { middleware: auth },
  },
  {
    path: '/reports',
    name: 'reports',
    meta: {
      middleware: auth,
    },
    redirect: { name: 'reports.time-tracking' },
    component: () => import('@/components/pages/reports/Router.vue'),
    children: [
      {
        path: 'time-tracking',
        name: 'reports.time-tracking',
        component: () =>
          import('@/components/pages/reports/time-tracking/Index.vue'),
      },
      {
        path: 'project-overview',
        name: 'reports.project-overview',
        component: () =>
          import('@/components/pages/reports/project-overview/Index.vue'),
      },
      {
        path: 'team-workload',
        name: 'reports.team-workload',
        component: () =>
          import('@/components/pages/reports/team-workload/Index.vue'),
      },
      {
        path: 'invoice-summary',
        name: 'reports.invoice-summary',
        component: () =>
          import('@/components/pages/reports/invoice-summary/Index.vue'),
      },
    ],
  },
  {
    path: '/invoices',
    name: 'invoices',
    meta: {
      middleware: auth,
    },
    redirect: { name: 'invoices.list' },
    component: () => import('@/components/pages/invoices/Router.vue'),
    children: [
      {
        path: 'list',
        name: 'invoices.list',
        component: () =>
          import('@/components/pages/invoices/list/Index.vue'),
      },
      {
        path: 'payments',
        name: 'invoices.payments',
        component: () =>
          import('@/components/pages/invoices/payments/Index.vue'),
      },
      {
        path: 'customers',
        name: 'invoices.customers',
        component: () =>
          import('@/components/pages/invoices/customers/Index.vue'),
      },
      {
        path: 'customers/:id',
        name: 'invoices.customer.detail',
        component: () =>
          import('@/components/pages/invoices/customers/Detail.vue'),
      },
      {
        path: ':inv_id/edit',
        name: 'invoices.edit',
        component: () =>
          import('@/components/pages/invoices/edit/Index.vue'),
      },
    ],
  },
  {
    path: '/open/:slug',
    meta: {
      middleware: openItemBaseOnSlug,
    },
    component: () => {},
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/components/pages/Login.vue'),
  },
  {
    name: 'register',
    path: '/register',
    component: () => import('@/components/pages/Register.vue'),
  },
  {
    name: 'forgot-password',
    path: '/forgot-password',
    component: () => import('@/components/pages/ForgotPassword.vue'),
  },
  {
    name: 'reset-password',
    path: '/reset-password',
    component: () => import('@/components/pages/ResetPassword.vue'),
  },
  {
    name: 'video-call',
    path: '/call/:slug',
    component: () => import('@/components/pages/video/Index.vue'),
  },
  {
    name: 'user.details',
    path: '/user/:id',
    component: () => import('@/components/pages/user/Index.vue'),
    meta: {
      middleware: auth,
    },
  },
  {
    name: 'not-found',
    path: '/404',
    component: () => import('@/components/pages/404.vue'),
  },
]
