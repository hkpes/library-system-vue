import http from '@/utils/http'
// 列表
export const getListApi = async(parm) => {
  return await http.get('/api/reader/list', parm)
}
// 新增
export const addReaderApi = async(parm) => {
  return await http.post('/api/reader', parm)
}
// 編輯
export const editReaderApi = async(parm) => {
  return await http.put('/api/reader', parm)
}
// 刪除
export const deleteReaderApi = async(parm) => {
  return await http.delete('/api/reader', parm)
}
// 會員註冊
export const registerApi = async(parm) => {
  return await http.post('/api/reader/register', parm)
}
// 讀者審核
export const applyReaderApi = async(parm) => {
  return await http.put('/api/reader/applyReader', parm)
}
// 讀者總數
export const getReaderCountApi = async(parm) => {
  return await http.get('/api/reader/getReaderCount', parm)
}
// 待審核會員總數
export const getApplyReaderCountApi = async(parm) => {
  return await http.get('/api/reader/getApplyReaderCount', parm)
}
// 重設密碼
export const resetPasswordApi = async(parm) => {
  return await http.post('/api/reader/resetPassword', parm)
}
// 根據電話查詢會員資料
export const getByPhoneApi = async(parm) => {
  return await http.get('/api/reader/getByPhone', parm)
}
