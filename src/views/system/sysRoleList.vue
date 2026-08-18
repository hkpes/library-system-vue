<template>
  <el-main>
    <!-- 搜尋欄 -->
    <el-form :model="listParm" label-width="80px" :inline="true"  >
      <el-form-item>
        <el-input
          v-model="listParm.roleName"
          placeholder="請輸入角色名稱"
        />
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button
            
          style="color: #e42f25b6"
          @click="resetBtn"
        > 重設</el-button>
        <el-button
          v-permission="['sys:role:add']"
          type="primary"
            
          @click="addBtn"
        > 新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column prop="roleName" label="角色名稱" />
      <el-table-column prop="roleType" label="角色類型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.roleType == '1'">系統角色</el-tag>
          <el-tag
            v-if="scope.row.roleType == '2'"
            type="success"
          >會員角色</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="角色備註" />
      <el-table-column label="操作"  width="460">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:role:edit']"
            type="primary"
             
              
            @click="editBtn(scope.row)"
          > 編輯</el-button>
          <el-button
            type="warning"
            @click="assignBtn(scope.row)"
          > 分配權限</el-button>
          <el-button
            v-if="scope.row.roleType == '2'"
            v-permission="['sys:role:delete']"
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
    <!-- 新增編輯彈框 -->
    <sys-dialog
      :title="dialog.title"
      :height="dialog.height"
      :visible="dialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          ref="addRef"
          :model="addModel"
          :rules="rules"
          label-width="80px"
           
        >
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="roleName" label="角色名稱">
                <el-input v-model="addModel.roleName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="角色類型">
                <el-select v-model="addModel.roleType" placeholder="請選擇">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item label="角色備註">
                <el-input v-model="addModel.remark" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>
    <!-- 分配權限的彈框 -->
    <sys-dialog
      :title="assignDialog.title"
      :visible="assignDialog.visible"
      :width="assignDialog.width"
      :height="assignDialog.height"
      @onConfirm="assignConfirm"
      @onClose="assignClose"
    >
      <div slot="content">
        <el-tree
          ref="assignTree"
          :data="assignTreeData"
          node-key="menuId"
          :props="defaultProps"
          empty-text="暫無數據"
          :show-checkbox="true"
          default-expand-all
          :default-checked-keys="assignTreeChecked"
        />
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from '@/components/dialog/SysDialog.vue'
import {
  getListApi,
  addRoleApi,
  editRoleApi,
  deleteRoleApi,
  getAssingShowApi,
  saveAssignApi
} from '@/api/role'
export default {
  // 註冊組件
  components: {
    SysDialog
  },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      options: [
        {
          value: '1',
          label: '系統用戶'
        },
        {
          value: '2',
          label: '會員'
        }
      ],
      // 表單驗證
      rules: {
        roleName: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫角色名稱'
          }
        ]
      },
      // 表单数据
      addModel: {
        type: '', // 0：新增 1：編輯
        roleId: '',
        roleName: '',
        remark: '',
        roleType: ''
      },
      // 彈框屬性
      dialog: {
        title: '',
        height: 150,
        visible: false
      },
      // 表格高度
      tableHeight: 0,
      // 列表查詢參數
      listParm: {
        pageSize: 10,
        currentPage: 1,
        roleName: '',
        total: 0
      },
      tableData: [],
      // 角色編號
      roleId: '',
      // 樹數據
      assignTreeData: [],
      // 角色原来的權限
      assignTreeChecked: [],
      assignDialog: {
        title: '',
        visible: false,
        width: 300,
        height: 450
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
    assignClose() {
      this.assignDialog.visible = false
    },
    async assignConfirm() {
      // 獲取樹選中的數據
      const ids = this.$refs.assignTree
        .getCheckedKeys()
        .concat(this.$refs.assignTree.getHalfCheckedKeys())
      console.log(ids)
      const parm = {
        roleId: this.roleId,
        list: ids
      }
      const res = await saveAssignApi(parm)
      if (res && res.code == 200) {
        this.$message({ type: 'success', message: res.msg })
        this.assignDialog.visible = false
      }
    },
    async assignBtn(row) {
      // 清空數據
      this.roleId = ''
      this.assignTreeData = []
      this.assignTreeChecked = []
      this.roleId = row.roleId
      // 設置彈框屬性
      this.assignDialog.title = '为【' + row.roleName + '】分配權限'
      this.assignDialog.visible = true
      // 獲取權限數據
      const parm = {
        userId: '3',
        roleId: this.roleId
      }
      const res = await getAssingShowApi(parm)
      console.log(res)
      if (res && res.code == 200) {
        this.assignTreeData = res.data.menuList
        this.assignTreeChecked = res.data.checkList
      }
      // 如果角色原来有權限
      if (this.assignTreeChecked.length > 0) {
        const newArr = []
        this.assignTreeChecked.forEach((item) => {
          this.checked(item, this.assignTreeData, newArr)
        })
        this.assignTreeChecked = newArr
      }
    },
    // 找出所有的回顯數據
    checked(id, data, newArr) {
      data.forEach((item) => {
        if (item.menuId == id) {
          // 是不是未級
          if (item.children && item.children.length == 0) {
            newArr.push(item.menuId)
          }
        } else {
          if (item.children && item.children.length != 0) {
            this.checked(id, item.children, newArr)
          }
        }
      })
    },
    // 彈框確定
    onConfirm() {
      // 表單驗證
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          this.dialog.visible = false
          let res = null
          if (this.addModel.type == '0') {
            res = await addRoleApi(this.addModel)
          } else {
            res = await editRoleApi(this.addModel)
          }
          if (res && res.code == 200) {
            // 信息提示
            this.$message({ type: 'success', message: res.msg })
            // 刷新表格
            this.getList()
          }
        }
      })
    },
    // 彈框關閉
    onClose() {
      this.dialog.visible = false
    },
    // 獲取列表
    async getList() {
      const res = await getListApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        // 設置表格數據
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
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
    // 刪除按鈕
    async deleteBtn(row) {
      // 确定
      const confirm = await this.$myconfirm('确定刪除該數據嗎?')
      if (confirm) {
        const res = await deleteRoleApi({ roleId: row.roleId })
        if (res && res.code == 200) {
          // 信息提示
          this.$message({ type: 'success', message: res.msg })
          // 刷新表格
          this.getList()
        }
      }
    },
    // 編輯按钮
    editBtn(row) {
      // 設置彈框屬性
      this.dialog.visible = true
      this.dialog.title = '新增角色'
      // 清空表單數據
      this.$resetForm('addRef', this.addModel)
      // 把要編輯的數據放到表單數據對象 
      this.$objCoppy(row, this.addModel)
      this.addModel.type = '1' // 編輯
    },
    // 新增按钮
    addBtn() {
      // 設置彈框屬性
      this.dialog.visible = true
      this.dialog.title = '新增角色'
      // 清空表單數據
      this.$resetForm('addRef', this.addModel)
      //
      this.addModel.type = '0'
    },
    // 重設按钮
    resetBtn() {
      this.listParm.roleName = ''
      this.getList()
    },
    // 搜索按钮
    searchBtn() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
