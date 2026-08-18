import { loginApi, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken,setUserId,getUserId,clearSession,setCurrentUsername,removeCurrentUsername } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login vuex裡面的使用者登入
  login({ commit }, userInfo) {
    const { username, password,userType } = userInfo
    return new Promise((resolve, reject) => {
      //api裡面的user.js模組裡面的login方法
      loginApi({ username: username.trim(), password: password,userType:userType }).then(response => {
        const { data } = response
        console.log('登录成功')
        console.log(data)
        //登入返回之後，把token存到vuex裡面
        commit('SET_TOKEN', data.token)
        //token存到cookies裡面
        setToken(data.token)
        setUserId(data.userId)
        // 儲存目前登入使用者的學號
        setCurrentUsername(username.trim())
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  //取得使用者的權限資訊和自己的訊息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo({userId:getUserId()}).then(response => {
        console.log('獲取用戶權限字段')
        console.log(response)
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state ,dispatch}) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        removeCurrentUsername() // 清除儲存的學號
        resetRouter()
        commit('RESET_STATE')
        //清空tagsview裡面的數據
        dispatch('tagsView/delAllViews', {}, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit,dispatch }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      removeCurrentUsername() // 清除儲存的學號
      clearSession();
      commit('RESET_STATE')
      //清空空tagsview裡面的數據
      dispatch('tagsView/delAllViews', {}, { root: true })
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

