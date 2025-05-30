import auth from './middleware/auth.js'
import openItemBaseOnSlug from './middleware/openItemBaseOnSlug.js'

function authRoute(obj) {
  return {
    ...obj,
  }
}

export default [
  {
    name: 'home',
    path: '/',
    component: () => import('../components/pages/dashboard/Index.vue'),
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
        component: () => import('../components/pages/settings/me/Index.vue'),
      },
      {
        name: 'settings.company',
        path: 'company',
        component: () =>
          import('../components/pages/settings/company/Company.vue'),
      },
      {
        name: 'settings.users',
        path: 'users',
        component: () => import('../components/pages/settings/users/Users.vue'),
      },
      {
        name: 'settings.roles',
        path: 'roles/:id',
        component: () => import('../components/pages/settings/role/Index.vue'),
      },
      {
        name: 'settings.invoice-items',
        path: 'invoice/items',
        component: () =>
          import('../components/pages/settings/invoice/Item.vue'),
      },
      {
        name: 'settings.company-info',
        path: 'billing/company',
        component: () =>
          import(
            '../components/pages/settings/invoice/company_information/Index.vue'
          ),
      },
      {
        name: 'settings.currency',
        path: 'currency',
        component: () =>
          import('../components/pages/settings/invoice/currency/Index.vue'),
      },
      {
        name: 'settings.mesurment-units',
        path: 'mesurment-units',
        component: () =>
          import(
            '../components/pages/settings/invoice/mesurment_units/Index.vue'
          ),
      },
      {
        name: 'settings.notes',
        path: 'notes',
        component: () =>
          import('../components/pages/settings/invoice/notes/Index.vue'),
      },
    ],
  },
  {
    name: 'chat',
    path: '/chat',
    component: () => import('../components/pages/chat/Index.vue'),
    meta: {
      middleware: auth,
    },
    children: [
      {
        name: 'chat-details',
        path: ':chatId/view',
        component: () => import('../components/pages/chat/ChatDetails.vue'),
      },
    ],
  },
  {
    name: 'projects',
    path: '/projects',
    component: () => import('../components/pages/project/Index.vue'),
  },
  {
    name: 'project-details',
    path: '/projects/:project',
    component: () => import('../components/pages/project/View.vue'),
    children: [
      {
        name: 'project.dashboard',
        path: 'dashboard',
        component: () => import('../components/pages/project/Dashboard.vue'),
      },
      {
        name: 'project.tasks',
        path: 'backlog',
        component: () => import('../components/pages/project/tasks/List.vue'),
      },
      {
        name: 'project.boards',
        path: 'boards/:board?',
        component: () => import('../components/pages/project/board/Index.vue'),
        children: [
          {
            name: 'project.board.view',
            path: 'view/:sprint?',
            component: () =>
              import('../components/pages/project/board/view/Board.vue'),
          },
          {
            name: 'project.board.tasks',
            path: 'tasks/:sprint?',
            component: () =>
              import('../components/pages/project/board/tasks/Index.vue'),
          },
          {
            name: 'project.board.settings',
            path: 'settings',
            component: () =>
              import('../components/pages/project/board/settings/Index.vue'),
          },
        ],
      },
      {
        name: 'project.documents',
        path: 'documents',
        component: () =>
          import('../components/pages/project/documents/Index.vue'),
      },
      {
        name: 'project.documents.editor',
        path: 'documents/:id',
        component: () =>
          import('../components/pages/project/documents/Editor.vue'),
      },
      {
        name: 'project.documents.settings',
        path: 'settings',
        component: () =>
          import('../components/pages/project/settings/Index.vue'),
        children: [
          {
            name: 'project.settings.users',
            path: 'users',
            component: () =>
              import('../components/pages/project/settings/Users.vue'),
          },
          {
            name: 'project.settings.security',
            path: 'users',
            component: () =>
              import('../components/pages/project/settings/Security.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/reports',

    name: 'reports',
    meta: {
      middleware: auth,
    },
    component: () => import('../components/pages/reports/Index.vue'),
  },
  {
    path: '/invoices',
    name: 'invoices',
    meta: {
      middleware: auth,
    },
    component: () => import('../components/pages/invoices/Router.vue'),
    children: [
      {
        path: 'index',
        default: true,
        name: 'invoices.index',
        component: () => import('../components/pages/invoices/Index.vue'),
      },
      {
        path: ':id',
        name: 'invoices.details',
        component: () =>
          import('../components/pages/invoices/details/Index.vue'),
      },
      {
        path: ':id/invoice/:inv_id',
        name: 'invoices.form',
        component: () =>
          import(
            '../components/pages/invoices/details/partials/invoice/View.vue'
          ),
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
    component: () => import('../components/pages/Login.vue'),
  },
  {
    name: 'register',
    path: '/register',
    component: () => import('../components/pages/Register.vue'),
  },
  {
    name: 'video-call',
    path: '/call/:slug',
    component: () => import('../components/pages/video/Index.vue'),
  },
  {
    name: 'user.details',
    path: '/user/:id',
    component: () => import('../components/pages/user/Index.vue'),
    meta: {
      middleware: auth,
    },
  },
  {
    name: 'not-found',
    path: '/404',
    component: () => import('../components/pages/404.vue'),
  },
]
