// import { getServer, getUser } from 'src/helpers/bkit'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue'),
        name: 'Home'
      },
      // {
      //   path: 'restore',
      //   component: () => import('pages/restore/RestorePage.vue'),
      //   name: 'Restore'
      // },
      {
        path: 'backup',
        component: () => import('pages/backup/BackupPage.vue'),
        name: 'Backup',
        beforeEnter: (to, from, next) => {
          console.log('to', to)
          console.log('from', from)
          next()
        }
      },
      {
        path: 'servers',
        component: () => import('pages/Servers.vue'),
        name: 'Servers'
      },
      {
        path: 'tasks',
        component: () => import('pages/tasks/TasksPage.vue'),
        name: 'tasks'
      },
      {
        path: 'update',
        component: () => import('pages/Update.vue'),
        name: 'update'
      },
      {
        path: 'customize',
        component: () => import('pages/Customize.vue'),
        name: 'customize'
      }
      /*,
      {
        path: 'recover/:path*',
        name: 'recover',
        props: true,
        component: import('pages/Recover.vue')
      }
      */
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
