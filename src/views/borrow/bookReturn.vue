<template>
  <el-main>
    <!-- 搜尋欄 -->
    <el-form :model="listParm" label-width="80px" :inline="true"  >
      <el-form-item label="電話">
        <el-input v-model="listParm.phone" />
      </el-form-item>
      <el-form-item label="借書狀態">
        <el-select v-model="listParm.borrowStatus" placeholder="請選擇">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button    @click="resetBtn"> 重設</el-button>
        <el-button
          type="primary"
          @click="returnBtn"
        > 批發還書
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table
      ref="tables"
      :height="tableHeight"
      :data="tableData"
      border
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="bookName" label="書本名稱" />
      <el-table-column prop="bookPlaceNum" label="書本編號" />
      <el-table-column prop="username" label="會員" />
      <el-table-column prop="phone" label="電話" />
      <el-table-column prop="borrowTime" label="借書時間" />
      <el-table-column prop="returnTime" label="還書時間" />
      <el-table-column
        prop="borrowStatus"
        label="借書狀態"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.borrowStatus == '0'" type="danger">審核中</el-tag>
          <el-tag v-if="scope.row.borrowStatus == '1'">在借中</el-tag>
          <el-tag
            v-if="scope.row.borrowStatus == '2'"
            type="success"
          >已還
          </el-tag>
          <el-tag
            v-if="scope.row.borrowStatus == '3'"
            type="danger"
          >拒絕
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column  label="操作" fixed="right"  width="340">
        <template slot-scope="scope">
          <el-button
            type="primary"
            @click="alongReturnBtn(scope.row)"
          > 還書
          </el-button>
          <el-button
            type="danger"
            @click="ExceptioReturnBtn(scope.row)"
          > 異常還書
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
    <!-- 異常還書備註 -->
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
          ref="exceptionRef"
          :model="exception"
          :rules="rules"
          label-width="80px"
           
        >
          <el-form-item prop="type" label="異常類型">
            <el-select v-model="exception.type" placeholder="請選擇">
              <el-option
                v-for="item in exoptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="excepionText" label="備註">
            <el-input
              v-model="exception.excepionText"
              type="textarea"
            />
          </el-form-item>
        </el-form>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from '@/components/dialog/SysDialog.vue'
import {
  returnBorrowApi,
  returnBooksApi,
  exceptionBooksApi
} from '@/api/borrow'

export default {
  components: {
    SysDialog
  },
  data() {
    return {
      rules: {
        type: [
          { required: true, message: '請選擇異常類型', trigger: 'change' }
        ],
        excepionText: [
          { required: true, message: '請填寫備註', trigger: 'change' }
        ]
      },
      exoptions: [
        {
          value: '0',
          label: '異常還書'
        },
        {
          value: '1',
          label: '丢失'
        }
      ],
      exception: {
        borrowId: '',
        bookId: '',
        type: '',
        excepionText: '',
        timeStatus: ''
      },
      // 彈框屬性定義
      dialog: {
        width: 630,
        height: 150,
        title: '還書備註', 
        visible: false
      },
      bookIds: [],
      tableHeight: 0,
      options: [
        {
          value: '0',
          label: '審核中'
        },
        {
          value: '1',
          label: '在借中'
        },
        {
          value: '2',
          label: '已還'
        },
        {
          value: '3',
          label: '拒絕'
        }
      ],
      tableData: [],
      listParm: {
        currentPage: 1,
        pageSize: 10,
        phone: '',
        borrowStatus: '1',
        total: 0,
        timeStatus: ''
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 220
    })
  },
  created() {
    this.returnBorrow()
  },
  methods: {
    onConfirm() {
      this.$refs.exceptionRef.validate(async(valid) => {
        if (valid) {
          const res = await exceptionBooksApi(this.exception)
          if (res && res.code == 200) {
            this.$message.success(res.msg)
            this.returnBorrow()
            this.dialog.visible = false
          }
        }
      })
    },
    onClose() {
      this.dialog.visible = false
    },
    // 異常還書的事件 
    ExceptioReturnBtn(row) {
      this.exception.borrowId = row.borrowId
      this.exception.bookId = row.bookId
      this.dialog.visible = true
    },
    // 單獨還書的時間
    async alongReturnBtn(row) {
      this.bookIds = []
      console.log(row)
      const confirm = await this.$myconfirm('確定還書嗎?')
      if (confirm) {
        if (row.borrowStatus == '1') {
          // 在借中的才能還
          const obj = {}
          obj.borrowId = row.borrowId
          obj.bookId = row.bookId
          this.bookIds.push(obj)
          const res = await returnBooksApi(this.bookIds)
          if (res && res.code == 200) {
            this.$message.success(res.msg)
            this.returnBorrow()
          }
        }
      }
    },
    currentChange(val) {
      this.listParm.currentPage = val
      this.returnBorrow()
    },
    sizeChange(val) {
      this.listParm.pageSize = val
      this.returnBorrow()
    },
    async returnBtn() {
      this.bookIds = []
      const confirm = await this.$myconfirm('確定還書嗎?')
      if (confirm) {
        const datas = this.$refs.tables.selection
        if (datas.length == 0) {
          this.$message.error('請選擇要還的書！')
          return
        }
        for (let i = 0; i < datas.length; i++) {
          const obj = {}
          obj.borrowId = datas[i].borrowId
          obj.bookId = datas[i].bookId
          this.bookIds.push(obj)
        }
        const res = await returnBooksApi(this.bookIds)
        if (res && res.code == 200) {
          this.$message.success(res.msg)
          this.returnBorrow()
        }
      }
    },
    resetBtn() {
      this.listParm.currentPage = 1
      this.listParm.phone = ''
      this.listParm.borrowStatus = ''
      this.returnBorrow()
    },
    searchBtn() {
      this.returnBorrow()
    },
    async returnBorrow() {
      const res = await returnBorrowApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
    }
  }
}
</script>

<style>
</style>
