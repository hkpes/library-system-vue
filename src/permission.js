import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist
// 全局守衛路由 
router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  // 从Cookies裏面獲取token
  const hasToken = getToken()
  // 判斷token是否存在
  if (hasToken) {
    // 判斷是否是登錄，是，直接跳到首頁
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // 從vuex裏面獲取用戶的所有權限
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        // 有權限，直接放行
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          // 從後端伺服器取得權限信息，vuex裡面的user模組的getInfo方法
          const { roles } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles
          // 動態產生選單和路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          console.log('產生動態路由')
          console.log(accessRoutes)
          const obj = { path: '*', redirect: '/404', hidden: true }
          accessRoutes.push(obj)
          // dynamically add accessible routes
          // 動態產生路由
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          console.log('進入異常')
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          // Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 判斷請求是否在白名單中
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      // 如果在白名單，直接放行
      next()
    } else {
      // 跳到登入
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
