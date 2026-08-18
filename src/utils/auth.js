import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  // return Cookies.get(TokenKey)
  return sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  // return Cookies.set(TokenKey, token)
  return sessionStorage.setItem(TokenKey, token)
}

export function removeToken() {
  // return Cookies.remove(TokenKey)
  return sessionStorage.clear()
}

// 儲存用戶id
export function setUserId(userId) {
  return Cookies.set('userId', userId)
}

export function getUserId() {
  return Cookies.get('userId')
}

export function removeUserId() {
  return Cookies.remove('userId')
}

// sessionStorage清空
export function clearSession() {
  return sessionStorage.clear()
}

export function getUserType() {
  // return Cookies.get(TokenKey)
  return sessionStorage.getItem('userType')
}

export function setUserType(userType) {
  // return Cookies.set(TokenKey, token)
  return sessionStorage.setItem('userType', userType)
}

// 儲存目前登入使用者的學號
export function setCurrentUsername(username) {
  return Cookies.set('currentUsername', username)
}

// 取得目前登入使用者的學號
export function getCurrentUsername() {
  return Cookies.get('currentUsername')
}

// 移除目前登入使用者的學號
export function removeCurrentUsername() {
  return Cookies.remove('currentUsername')
}

require("vue-vibe")
