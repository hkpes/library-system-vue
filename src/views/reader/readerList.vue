<template>
  <el-main>
    <!-- 搜尋欄 -->
    <el-form :model="listParm" :inline="true">
      <el-form-item>
        <el-input v-model="listParm.username" placeholder="請輸入姓名" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="listParm.phone" placeholder="請輸入電話號碼" />
      </el-form-item>
      <el-form-item>
        <el-button @click="searchBtn"> 搜尋</el-button>
        <el-button style="color: #e42f25b6" @click="resetBtn"> 重設
        </el-button>
        <el-button v-permission="['sys:reader:add']" type="primary" @click="addBtn"> 新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column prop="username" label="姓名" width="100" />
      <el-table-column prop="phone" label="電話" width="120" />
      <el-table-column prop="email" label="電郵" width="180" />
      <el-table-column prop="sex" label="性別" width="70">
        <template slot-scope="scope">
          <span v-if="scope.row.sex == '0'">男</span>
          <span v-if="scope.row.sex == '1'">女</span>
        </template>
      </el-table-column>
      <el-table-column prop="checkStatus" label="審核狀態">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.checkStatus == '0'" type="danger">未審核
          </el-tag>
          <el-tag v-if="scope.row.checkStatus == '1'">已審核</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userStatus" label="用戶狀態">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.userStatus == '0'">停用</el-tag>
          <el-tag v-if="scope.row.userStatus == '1'">啟用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="550">
        <template slot-scope="scope">
          <el-button v-permission="['sys:reader:edit']" type="primary" @click="editBtn(scope.row)"> 編輯
          </el-button>
          <el-button v-permission="['sys:reader:apply']" type="warning" v-if="scope.row.checkStatus == '0'" @click="applyBtn(scope.row)"> 同意
          </el-button>
          <el-button v-permission="['sys:reader:resetpassword']" type="danger" @click="resetPasswordBtn(scope.row)">
            重設密碼
          </el-button>
          <el-button v-permission="['sys:reader:delete']" type="danger" @click="deleteBtn(scope.row)"> 刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分頁 -->
    <el-pagination :current-page.sync="listParm.currentPage" :page-sizes="[15, 20, 40, 80, 100]"
      :page-size="listParm.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="listParm.total" background
      @size-change="sizeChange" @current-change="currentChange" />
    <!-- 新增彈框 -->
    <sys-dialog :title="dialog.title" :width="dialog.width" :height="dialog.height" :visible="dialog.visible"
      @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form ref="addRef" :model="addModel" :rules="rules" label-width="80px" style="margin-right: 30px">
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="username" label="姓名">
                <el-input v-model="addModel.username" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="phone" label="電話">
                <el-input v-model="addModel.phone" maxlength="11" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="email" label="電郵">
                <el-input v-model="addModel.email" />
              </el-form-item>
            </el-col>
            <el-col v-if="addModel.type == '0'" :span="12" :offset="0">
              <el-form-item prop="password" label="密碼">
                <el-input v-model="addModel.password" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item label="性别">
                <el-radio-group v-model="addModel.sex">
                  <el-radio :label="'0'">男</el-radio>
                  <el-radio :label="'1'">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from '@/components/dialog/SysDialog.vue'
import {
  getListApi,
  addReaderApi,
  editReaderApi,
  deleteReaderApi,
  applyReaderApi,
  resetPasswordApi
} from '@/api/reader'

export default {
  // 註冊組件
  components: {
    SysDialog
  },
  data() {
    return {
      // 彈框屬性
      dialog: {
        title: '',
        width: 640,
        height: 230,
        visible: false
      },
      rules: {
        username: [{ required: true, message: '請填寫姓名', trigger: 'blur' }],
        phone: [
          { pattern: /^[2-9]\d{7}$/, required: true, message: '請輸入正確的手機號碼', trigger: 'blur' }
        ],
        password: [{ required: true, message: '請填寫密碼', trigger: 'blur' }]
      },
      // 表單屬性
      addModel: {
        type: '',
        readerId: '',
        username: '',
        sex: '',
        phone: '',
        email: '',
        password: '',
        checkStatus: '',
        userStatus: ''
      },
      // 表格高度
      tableHeight: 0,
      // 表格數據
      tableData: [],
      // 列表參數
      listParm: {
        total: 0,
        currentPage: 1,
        pageSize: 15,
        username: '',
        phone: ''
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220
    })
  },
  created() {
    this.getList()
  },
  methods: {
    async resetPasswordBtn(row) {
      const confirm = await this.$myconfirm('確定重設密碼嗎，重設之後預設密碼為【123456】?')
      if (confirm) {
        console.log(row)
        const res = await resetPasswordApi({
          readerId: row.readerId
        })
        if (res && res.code == 200) {
          this.$message.success(res.msg)
        }
      }
    },
    async applyBtn(row) {
      const confirm = await this.$myconfirm('確定通過審核嗎?') 
      if (confirm) {
        console.log(row)
        const res = await applyReaderApi({ readerId: row.readerId })
        if (res && res.code == 200) {
          this.$message.success(res.msg)
          // 刷新表格
          this.getList()
        }
      }
    },
    // 彈框確認
    onConfirm() {
      this.$refs.addRef.validate(async (valid) => {
        if (valid) {
          let res = null
          if (this.addModel.type == '0') {
            res = await addReaderApi(this.addModel)
          } else {
            res = await editReaderApi(this.addModel)
          }
          if (res && res.code == 200) {
            // 信息提示
            this.$message({ type: 'success', message: res.msg })
            // 刷新表格
            this.getList()
            this.dialog.visible = false
          }
        }
      })
    },
    // 彈框關閉
    onClose() {
      this.dialog.visible = false
    },
    // 頁數改變時觸發
    currentChange(val) {
    },
    // 頁容量改變時觸發
    sizeChange(val) {
    },
    // 取得列表
    async getList() {
      const res = await getListApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
    },
    // 刪除按鈕
    async deleteBtn(row) {
      const confirm = await this.$myconfirm('確定刪除該數據嗎?')
      if (confirm) {
        const res = await deleteReaderApi({ readerId: row.readerId })
        if (res && res.code == 200) {
          // 信息提示
          this.$message({ type: 'success', message: res.msg })
          // 刷新表格
          this.getList()
        }
      }
    },
    // 編輯按鈕
    editBtn(row) {
      this.dialog.title = '編輯會員'
      this.dialog.visible = true
      // 清空表单
      this.$resetForm('addRef', this.addModel)
      // 把要編輯的資料複製到表單資料域
      this.$objCoppy(row, this.addModel)
      // 設定編輯屬性
      this.addModel.type = '1'
    },
    // 新增按鈕
    addBtn() {
      this.dialog.title = '新增會員'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 設定編輯屬性
      this.addModel.type = '0'
    },
    // 重設按鈕
    resetBtn() {
      this.listParm.username = ''
      this.listParm.phone = ''
      this.getList()
    },
    // 搜索按鈕
    searchBtn() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped></style>
