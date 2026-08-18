<template>
  <el-main>
    <!--搜尋欄 -->
    <el-form :model="listParm" :inline="true"  >
      <el-form-item>
        <el-select v-model="listParm.categoryId" placeholder="請選擇">
          <el-option
            v-for="item in options"
            :key="item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="listParm.bookName"
          placeholder="請輸入書本名稱"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="listParm.bookPlaceNum"
          placeholder="請輸入書本編號"
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="listParm.bookAuther"
          placeholder="請輸入作者"
        />
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 查詢</el-button>
        <el-button
          style="color: #e42f25b6"
            
          @click="resetBtn"
        > 重設
        </el-button>
        <el-button
          v-permission="['sys:bookList:add']"
          type="primary"
            
          @click="addBtn"
        > 新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column label="書本名稱" prop="bookName" />
      <el-table-column label="書本分類" prop="categoryName" />
      <el-table-column label="書本編號" prop="bookPlaceNum" />
      <el-table-column label="作者" prop="bookAuther" />
      <el-table-column label="出版社" prop="bookProduct" />
      <el-table-column label="庫存" prop="bookStore" width="70" align="center" />
      <el-table-column  label="操作" fixed="right"  width="260">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:bookList:edit']"
              
            type="primary"
             
            @click="editBtn(scope.row)"
          > 編輯
          </el-button>
          <el-button
            v-permission="['sys:bookList:delete']"
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
    <!-- 新增彈框 -->
    <sys-dialog
      :title="dialog.title"
      :height="dialog.height"
      :width="dialog.width"
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
           
          style="margin-right: 10px"
        >
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="categoryId" label="書本分類">
                <el-select v-model="addModel.categoryId" placeholder="請選擇">
                  <el-option
                    v-for="item in options"
                    :key="item.categoryId"
                    :label="item.categoryName"
                    :value="item.categoryId"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="bookName" label="書本名稱">
                <el-input v-model="addModel.bookName" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="bookPlaceNum" label="書本編號">
                <el-input v-model="addModel.bookPlaceNum" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="bookAuther" label="書本作者">
                <el-input v-model="addModel.bookAuther" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="bookProduct" label="出版社">
                <el-input v-model="addModel.bookProduct" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="bookStore" label="書本庫存">
                <el-input v-model="addModel.bookStore" />
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
  getCateListApi,
  addBookApi,
  editBookApi,
  deleteBookApi
} from '@/api/book'

export default {
  components: {
    SysDialog
  },
  data() {
    return {
      // 表單驗證規則
      rules: {
        categoryId: [
          {
            required: true,
            trigger: 'blur',
            message: '請選擇書本分類'
          }
        ],
        bookPlaceNum: [
          {
            required: true,
            trigger: 'blur',
            message: '請填寫書本編號'
          }
        ],
        bookProduct: [
          {
            required: true,
            trigger: 'blur',
            message: '請填寫書本出版社'
          }
        ],
        bookAuther: [
          {
            required: true,
            trigger: 'blur',
            message: '請填寫作者'
          }
        ],
        bookStore: [
          {
            required: true,
            trigger: 'blur',
            message: '請填寫庫存'
          }
        ],
        bookName: [
          {
            required: true,
            trigger: 'blur',
            message: '請填寫書本名稱'
          }
        ]
      },
      // 表單綁定的數據
      addModel: {
        bookId: '',
        categoryId: '',
        bookName: '',
        categoryName: '',
        bookPlaceNum: '',
        bookProduct: '',
        bookAuther: '',
        bookPrice: '',
        bookStore: '',
        type: ''
      },
      // 彈框屬性
      dialog: {
        height: 250,
        width: 650,
        visible: false,
        title: ''
      },
      // 下拉數據
      options: [],
      // 表格高度
      tableHeight: 0,
      // 表格數據
      tableData: [],
      // 名單查詢參數
      listParm: {
        currentPage: 1,
        pageSize: 10,
        categoryId: '',
        bookName: '',
        bookPlaceNum: '',
        bookAuther: '',
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
    this.getCateList()
    this.getList()
  },
  methods: {
    // 名單查詢
    async getList() {
      const res = await getListApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
    },
    // 彈框確定事件
    onConfirm() {
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          let res = null
          if (this.addModel.type == '0') {
            res = await addBookApi(this.addModel)
          } else {
            res = await editBookApi(this.addModel)
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
    // 新增彈框關閉
    onClose() {
      this.dialog.visible = false
    },
    // 查詢分類名單
    async getCateList() {
      const res = await getCateListApi()
      if (res && res.code == 200) {
        console.log(res)
        this.options = res.data
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
      const confirm = await this.$myconfirm('確定刪除該數據嗎?')
      if (confirm) {
        const res = await deleteBookApi({ bookId: row.bookId })
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
      this.dialog.title = '編輯書本'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 把目前要編輯的資料複製到表單綁定的資料域裡面
      this.$objCoppy(row, this.addModel)
      this.addModel.type = '1'
    },
    // 新增按鈕
    addBtn() {
      this.dialog.title = '新增書本'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      this.addModel.type = '0'
    },
    // 重設按鈕
    resetBtn() {
      this.listParm.categoryId = ''
      this.listParm.bookName = ''
      this.listParm.bookPlaceNum = ''
      this.listParm.bookAuther = ''
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

