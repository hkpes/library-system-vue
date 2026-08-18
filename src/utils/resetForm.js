// 重設表單
export default function resetForm(formName, obj) {
  // 重設表單
  if (this.$refs[formName]) {
    this.$refs[formName].resetFields()
    this.$refs[formName].clearValidate()
  }
  // 清空數據
  Object.keys(obj).forEach(key => {
    obj[key] = ''
  })
}
