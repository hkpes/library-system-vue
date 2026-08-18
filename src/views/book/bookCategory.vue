<template>
  <!--圖書分類 -->
  <el-main>
    <!--搜尋欄 -->
    <el-form :model="listParm" label-width="80px" :inline="true"  >
      <el-form-item>
        <el-input
          v-model="listParm.categoryName"
          placeholder="請輸入類型名稱"
        />
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button
            
          style="color: #e42f25b6"
          @click="resetBtn"
        > 重設
        </el-button>
        <el-button
          v-permission="['sys:bookCategory:add']"
          type="primary"
            
          @click="addBtn"
        > 新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column prop="categoryName" label="分類名稱" />
      <el-table-column prop="orderNum" label="序號" />
      <el-table-column  label="操作" fixed="right"  width="260">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:bookCategory:edit']"
            type="primary"
             
              
            @click="editBtn(scope.row)"
          > 編輯
          </el-button>
          <el-button
            v-permission="['sys:bookCategory:delete']"
            type="danger"
             
             
            @click="deleteBtn(scope.row)"
          > 刪除
          </el-button>
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
    <!-- 新增、編輯頁面 -->
    <sys-dialog
      :title="dialog.title"
      :width="dialog.width"
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
           
          style="margin-right: 15px"
        >
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="categoryName" label="分類名稱">
                <el-input v-model="addModel.categoryName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="序號">
                <el-input v-model="addModel.orderNum" />
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
import { getListApi, addApi, editApi, deleteApi } from '@/api/category'

export default {
  // 註冊
  components: {
    SysDialog
  },
  data() {
    return {
      // 表單驗證規則
      rules: {
        categoryName: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫分類名稱'
          }
        ]
      },
      // 表單綁定的屬性
      addModel: {
        type: '',
        categoryId: '',
        categoryName: '',
        orderNum: ''
      },
      // 彈框屬性
      dialog: {
        width: 630,
        height: 150,
        title: '',
        visible: false
      },
      // 表格高度
      tableHeight: 0,
      // 表格數據
      tableData: [],
      // 列表参數
      listParm: {
        currentPage: 1,
        pageSize: 10,
        categoryName: '',
        total: 0
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
    // 彈框關閉
    onClose() {
      this.dialog.visible = false
    },
    // 彈框確定
    onConfirm() {
      // 表單驗證
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          let res = null
          if (this.addModel.type == '0') {
            res = await addApi(this.addModel)
          } else {
            res = await editApi(this.addModel)
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
    // 取得列表
    async getList() {
      const res = await getListApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
    },
    // 頁數改變時觸發事件
    currentChange(val) {
      this.listParm.currentPage = val
      this.getList()
    },
    // 頁容量改動時觸發事件
    sizeChange(val) {
      this.listParm.pageSize = val
      this.getList()
    },
    // 刪除按鈕
    async deleteBtn(row) {
      // 信息確認
      const confrim = await this.$myconfirm('确定删除该数据吗?')
      if (confrim) {
        const res = await deleteApi({ categoryId: row.categoryId })
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
      // 設定彈框屬性
      this.dialog.title = '編輯分類'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 把要編輯的資料複製到表單資料域
      this.$objCoppy(row, this.addModel)
      this.addModel.type = '1'
    },
    // 新增
    addBtn() {
      // 設置彈框屬性
      this.dialog.title = '新增分類'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      this.addModel.type = '0'
    },
    // 重設按鈕
    resetBtn() {
      // 清空表單
      this.listParm.categoryName = ''
      this.getList()
    },
    // 搜索按鈕
    searchBtn() {
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
