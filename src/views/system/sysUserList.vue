<template>
  <el-main>
    <el-form
      ref="searchRef"
      :model="listParm"
      label-width="80px"
      :inline="true"
       
      :rules="rules"
    >
      <el-form-item>
        <el-input
          v-model="listParm.nickName"
          placeholder="請輸入姓名"
        />
      </el-form-item>
      <el-form-item>
        <el-input v-model="listParm.phone" placeholder="請輸入電話" />
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button
            
          style="color: #e42f25b6"
          @click="resetBtn"
        > 重設</el-button>
        <el-button
          v-permission="['sys:user:add']"
          type="primary"
            
          @click="addBtn"
        > 新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格
     data： 表格的數據
      -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column prop="nickName" label="姓名" />
      <el-table-column prop="phone" label="電話" />
      <el-table-column prop="email" label="電郵" />
      <el-table-column label="操作" fixed="right" width="460">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:user:edit']"
            type="primary"
            @click="editBtn(scope.row)"
          > 編輯</el-button>
          <el-button
            v-permission="['sys:user:resetpassword']"
            type="warning"
            @click="resetPasswordBtn(scope.row)"
          > 重設密碼</el-button>
          <el-button
            v-permission="['sys:user:delete']"
            type="danger"
            @click="deleteBtn(scope.row)"
          > 刪除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分頁 -->
    <el-pagination
      :current-page.sync="listParm.currentPage"
      :page-sizes="[10, 20, 40, 80, 100]"
      :page-size="listParm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="listParm.total"
      background
      @size-change="sizeChange"
      @current-change="currentChange"
    />
    <!-- 新增或編輯彈框 -->
    <sys-dialog
      :title="dialog.title"
      :visible="dialog.visible"
      :width="dialog.width"
      :height="dialog.height"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <!-- el-form : 當做一個普通的form標籤
        model ：表單綁定的數據對象
        ref ： 相當於div的id , 唯一的
        rules ： 表單驗證規則
        label-width ： 表單域標籤的寬度
        inline ： 是否在同一行展示
        size ：尺寸
         -->
        <el-form
          ref="addRef"
          :model="addModel"
          :rules="rules"
          label-width="80px"
          :inline="false"
           
          style="margin-right: 40px"
        >
          <!-- el-row  : 代表一行，分為24等分
              el-col ： 代表列
         -->
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="nickName" label="姓名">
                <el-input v-model="addModel.nickName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="phone" label="電話">
                <el-input v-model="addModel.phone" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item label="電郵">
                <el-input v-model="addModel.email" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="sex" label="性别">
                <el-radio-group v-model="addModel.sex">
                  <el-radio :label="'0'">男</el-radio>
                  <el-radio :label="'1'">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="username" label="帳戶">
                <el-input v-model="addModel.username" />
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
              <el-form-item prop="username" label="角色">
                <el-select v-model="addModel.roleId" placeholder="請選擇">
                  <el-option
                    v-for="item in options"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import {
  addUserApi,
  editUserApi,
  getListApi,
  deleteUserApi,
  getRoleListApi,
  getRoleIdApi,
  resetPasswordApi
} from '@/api/user'
// 引入彈框組件
import SysDialog from '@/components/dialog/SysDialog.vue'
export default {
  // 註冊組件
  components: {
    SysDialog
  },
  data() {
    return {
      options: [],
      // 表單驗證規則
      rules: {
        nickName: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫姓名'
          }
        ],
        phone: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫電話'
          }
        ],
        sex: [
          {
            trigger: 'blur',
            required: true,
            message: '請選擇性別'
          }
        ],
        username: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫帳戶'
          }
        ],
        password: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫密碼'
          }
        ]
      },
      // 表單綁定的數據
      addModel: {
        roleId: '',
        type: '', // 0:新增 1：編輯
        userId: '',
        nickName: '',
        phone: '',
        email: '',
        sex: '',
        username: '',
        password: ''
      },
      // 彈框屬性
      dialog: {
        title: '',
        visible: false,
        width: 630,
        height: 230
      },
      // 表格的高度
      tableHeight: 0,
      // 列表查詢的參數
      listParm: {
        nickName: '',
        phone: '',
        currentPage: 1,
        pageSize: 10,
        total: 3
      },
      // 表格的數據
      tableData: []
    }
  },
  created() {
    this.getList()
    this.getRoleList()
  },
  mounted() {
    this.$nextTick(() => {
      // 計算表格高度
      this.tableHeight = window.innerHeight - 220
    })
  },
  methods: {
    async resetPasswordBtn(row) {
      const confirm = await this.$myconfirm('確定重設密碼嗎，重設之後預設密碼為【123456】?')
      if (confirm) {
        console.log(row)
        const res = await resetPasswordApi({
          userId: row.userId
        })
        if (res && res.code == 200) {
          this.$message.success(res.msg)
        }
      }
    },
    async getRoleId(userId) {
      const res = await getRoleIdApi({ userId: userId })
      if (res && res.code == 200) {
        console.log(res)
        this.addModel.roleId = res.data.roleId
      }
    },
    // 重設按钮
    resetBtn() {
      this.listParm.nickName = ''
      this.listParm.phone = ''
      this.getList()
    },
    // 搜索按钮
    searchBtn() {
      this.getList()
    },
    // 獲取列表
    async getList() {
      const res = await getListApi(this.listParm)
      console.log('返回成功')
      console.log(res)
      if (res && res.code == 200) {
        this.tableData = res.data.records
        this.total = res.data.total
      }
    },
    // 彈框确定
    onConfirm() {
      // 表單驗證
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          let res = null
          if (this.addModel.type == '0') {
            res = await addUserApi(this.addModel)
          } else {
            res = await editUserApi(this.addModel)
          }
          if (res && res.code == 200) {
            // 信息提示
            this.$message({ type: 'success', message: res.msg })
            // 刷新表格
            this.getList()
            // 關閉彈框
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
      this.listParm.currentPage = val
      this.getList()
    },
    // 頁容量改變時觸發
    sizeChange(val) {
      this.listParm.pageSize = val
      this.getList()
    },
    // 刪除按钮
    async deleteBtn(row) {
      const confirm = await this.$myconfirm('确定刪除該數據嗎?')
      if (confirm) {
        const res = await deleteUserApi({ userId: row.userId })
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
      // 設置彈框屬性
      this.dialog.title = '編輯用戶'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)

      // 把要編輯的資料複製到表單綁定的資料域
      this.$objCoppy(row, this.addModel)
      // 設置編輯
      this.addModel.type = '1'
      this.getRoleId(row.userId)
    },
    // 新增按鈕
    addBtn() {
      // 設置彈框屬性
      this.dialog.title = '新增用戶'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 設置為新增
      this.addModel.type = '0'
    },
    async getRoleList() {
      const res = await getRoleListApi()
      console.log(res)
      if (res && res.code == 200) {
        this.options = res.data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
