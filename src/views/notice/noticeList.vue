<template>
  <el-main>
    <!-- 搜尋欄 -->
    <el-form :model="noticeParm" label-width="80px" :inline="true"  >
      <el-form-item label="公告標題">
        <el-input v-model="noticeParm.noticeTitle" />
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button
            
          style="color: #e42f25b6"
          @click="resetBtn"
        > 重設
        </el-button>
        <el-button
          v-permission="['sys:noticeList:add']"
          type="primary"
            
          @click="addBtn"
        > 新增
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
       
      :height="tableHeight"
      :data="tableData"
      border
      stripe
    >
      <el-table-column prop="noticeTitle" label="公告標題" />
      <el-table-column prop="noticeContent" label="公告内容" />
      <el-table-column prop="createTime" label="公告時間" />
      <el-table-column  label="操作" fixed="right"  width="260">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:noticeList:edit']"
            type="primary"
             
              
            @click="editBtn(scope.row)"
          > 編輯
          </el-button>
          <el-button
            v-permission="['sys:noticeList:delete']"
            type="danger"
             
             
            @click="deleteBtn(scope.row)"
          > 刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分頁 -->
    <el-pagination
      :current-page.sync="noticeParm.currentPage"
      :page-sizes="[10, 20, 40, 80, 100]"
      :page-size="noticeParm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="noticeParm.total"
      background
      @size-change="sizeChange"
      @current-change="currentChange"
    />
    <!-- 新增、編輯彈框 -->
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
          :inline="false"
           
        >
          <el-form-item prop="noticeTitle" label="標題">
            <el-input v-model="addModel.noticeTitle" />
          </el-form-item>
          <el-form-item prop="noticeContent" label="內容">
            <el-input
              v-model="addModel.noticeContent"
              type="textarea"
            />
          </el-form-item>
        </el-form>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import { addApi, editApi, deleteApi } from '@/api/notice'
import SysDialog from '@/components/dialog/SysDialog.vue'
import { getListApi } from '@/api/notice'

export default {
  // 註冊組件
  components: {
    SysDialog
  },
  data() {
    return {
      // 表單驗證規則
      rules: {
        noticeTitle: [
          { required: true, message: '請輸入標題', trigger: 'blur' }
        ],
        noticeContent: [
          { required: true, message: '請輸入內容', trigger: 'blur' }
        ]
      },
      addModel: {
        editType: '', // 0：新增 1：編輯
        noticeId: '',
        noticeTitle: '',
        noticeContent: ''
      },
      // 彈框屬性
      dialog: {
        title: '',
        width: 650,
        height: 180,
        visible: false
      },
      tableHeight: 0,
      tableData: [],
      noticeParm: {
        currentPage: 1,
        pageSize: 10,
        noticeTitle: '',
        total: 0
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220
    })
  },
  methods: {
    onConfirm() {
      // 表單驗證
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          let res = null
          if (this.addModel.editType == '0') {
            res = await addApi(this.addModel)
          } else {
            res = await editApi(this.addModel)
          }
          if (res && res.code == 200) {
            this.$message.success(res.msg)
            this.getList()
            this.dialog.visible = false
          }
        }
      })
    },
    onClose() {
      this.dialog.visible = false
    },
    currentChange(val) {
    },
    sizeChange(val) {
    },
    async deleteBtn(row) {
      const confirm = await this.$myconfirm('確定刪除改數據嗎?')
      if (confirm) {
        const parm = {
          noticeId: row.noticeId
        }
        const res = await deleteApi(parm)
        if (res && res.code == 200) {
          this.$message.success(res.msg)
          this.getList()
        }
      }
    },
    editBtn(row) {
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 把要編輯的資料設定到addModel裡面
      this.$objCoppy(row, this.addModel)
      // 設置type
      this.addModel.editType = '1'
      // 彈框顯示
      this.dialog.title = '編輯公告'
      this.dialog.visible = true
    },
    // 重設按鈕
    resetBtn() {
      this.noticeParm.noticeTitle = ''
      this.getList()
    },
    // 搜索按鈕
    searchBtn() {
      this.getList()
    },
    // 新增按鈕
    addBtn() {
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 設置type
      this.addModel.editType = '0'
      // 彈框提示
      this.dialog.title = '新增公告'
      this.dialog.visible = true
    },
    async getList() {
      const res = await getListApi(this.noticeParm)
      if (res && res.code == 200) {
        this.tableData = res.data.records
        this.noticeParm.total = res.data.total
      }
    }
  }
}
</script>

<style>
</style>
