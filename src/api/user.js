import request from '@/utils/request'
import http from '@/utils/http'
// 此登錄，mock.js數據,實際開發中，會調用後端接口
// export function login(data) {
//   return request({
//     url: '/vue-admin-template/user/login',
//     method: 'post',
//     data
//   })
// }
export const loginApi = async(parm) => {
  return await http.post('/api/system/login', parm)
}
// export function getInfo(token) {
//   return request({
//     url: '/vue-admin-template/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

export const getInfo = async(parm) => {
  return await http.get('/api/system/getInfo', parm)
}

export function logout() {
  return request({
    url: '/vue-admin-template/user/logout',
    method: 'post'
  })
}

// 獲取用戶列表
export const getListApi = async(parm) => {
  return await http.get('/api/user/list', parm)
}
// 新增
export const addUserApi = async(parm) => {
  return await http.post('/api/user', parm)
}
// 編輯
export const editUserApi = async(parm) => {
  return await http.put('/api/user', parm)
}
// 刪除
export const deleteUserApi = async(parm) => {
  return await http.delete('/api/user', parm)
}
// 獲取角色列表
export const getRoleListApi = async() => {
  return await http.get('/api/user/getRoleList', null)
}
// 根據用戶id查詢角色
export const getRoleIdApi = async(parm) => {
  return await http.get('/api/user/getRoleId', parm)
}
// 獲取菜單列表
export const getMenuListApi = async() => {
  return await http.get('/api/system/getMenuList', null)
}
// 修改密碼
export const updatePasswordApi = async(parm) => {
  return await http.post('/api/user/updatePassword', parm)
}
// 重設密碼
export const resetPasswordApi = async(parm) => {
  return await http.post('/api/user/resetPassword', parm)
}
