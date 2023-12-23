import auth from "./middleware/auth.js";
import openItemBaseOnSlug from "./middleware/openItemBaseOnSlug.js";

function authRoute(
    obj
) {
    return {
        ...obj,

    };
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
                component: () => import('../components/pages/settings/company/Company.vue'),
            },
            {
                name: 'settings.users',
                path: 'users',
                component: () => import('../components/pages/settings/users/Users.vue'),
            },
            {
                name: 'settings.roles',
                path: 'roles',
                component: () => import('../components/pages/settings/role/Index.vue'),
            }
        ]
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
            }
        ]
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
                        component: () => import('../components/pages/project/board/view/Board.vue'),
                    },
                    {
                        name: 'project.board.tasks',
                        path: 'tasks/:sprint?',
                        component: () => import('../components/pages/project/board/tasks/Index.vue'),
                    },
                    {
                        name: 'project.board.settings',
                        path: 'settings',
                        component: () => import('../components/pages/project/board/settings/Index.vue'),
                    },
                ]
            },
            {
                name: 'project.documents',
                path: 'documents',
                component: () => import('../components/pages/project/documents/Index.vue'),
            },
            {
                name: 'project.documents.editor',
                path: 'documents/:id',
                component: () => import('../components/pages/project/documents/Editor.vue'),
            },
            {
                name: 'project.documents.settings',
                path: 'settings',
                component: () => import('../components/pages/project/settings/Index.vue'),
                children: [
                    {
                        name: 'project.settings.users',
                        path: 'users',
                        component: () => import('../components/pages/project/settings/Users.vue')
                    },
                    {
                        name: 'project.settings.security',
                        path: 'users',
                        component: () => import('../components/pages/project/settings/Security.vue')
                    }
                ]
            },

        ]
    },
    {
        path: '/open/:slug',
        meta: {
            middleware: openItemBaseOnSlug,
        },
        component: () => {
        }
    },
    {
        name: 'login',
        path: '/login',
        component: () => import('../components/pages/Login.vue')
    },
    {
        name: 'register',
        path: '/register',
        component: () => import('../components/pages/Register.vue')
    },
    {
      name: 'video-call',
      path: '/call/:slug',
      component: () => import('../components/pages/video/Index.vue')
    },
    {
        name: 'not-found',
        path: '/404',
        component: () => import('../components/pages/404.vue')
    },


]
