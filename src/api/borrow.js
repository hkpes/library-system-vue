import http from '@/utils/http'
// 借書
export const borrowApi = async(parm) => {
  return await http.post('/api/borrow', parm)
}
// 還書列表
export const returnBorrowApi = async(parm) => {
  return await http.get('/api/borrow/getBorrowList', parm)
}
// 還書
export const returnBooksApi = async(parm) => {
  return await http.post('/api/borrow/returnBooks', parm)
}
// 異常還書
export const exceptionBooksApi = async(parm) => {
  return await http.post('/api/borrow/exceptionBooks', parm)
}
// 借閱查看
export const getLookBorrowListApi = async(parm) => {
  return await http.get('/api/borrow/getLookBorrowList', parm)
}
export const applyBookApi = async(parm) => {
  return await http.post('/api/borrow/applyBook', parm)
}
// 還書續期
export const addTimeApi = async(parm) => {
  return await http.post('/api/borrow/addTime', parm)
}
// 借書待審核總數
export const getBorrowApplyCountApi = async(parm) => {
  return await http.get('/api/borrow/getBorrowApplyCount', parm)
}
// 到期待還書總數
export const getBorrowReturnCountApi = async(parm) => {
  return await http.get('/api/borrow/getBorrowReturnCount', parm)
}

