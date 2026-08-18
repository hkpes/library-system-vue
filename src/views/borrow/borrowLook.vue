<template>
  <el-main>
    <!-- =搜尋欄 -->
    <el-form :model="lookParm" label-width="80px" :inline="true"  >
      <el-form-item label="電話">
        <el-input v-model="lookParm.phone"/>
      </el-form-item>
      <el-form-item label="書本名稱">
        <el-input v-model="lookParm.bookName"/>
      </el-form-item>
      <el-form-item label="借書狀態">
        <el-select v-model="lookParm.borrowStatus" placeholder="請選擇">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="異常狀態">
        <el-select v-model="lookParm.returnStatus" placeholder="請選擇">
          <el-option
            v-for="item in exceoptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="到期狀態">
        <el-select v-model="lookParm.timeStatus" placeholder="請選擇">
          <el-option
            v-for="item in timetions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="審核狀態">
        <el-select v-model="lookParm.applyStatus" placeholder="請選擇">
          <el-option
            v-for="item in applytions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button    @click="searchBtn"> 搜尋</el-button>
        <el-button
          style="color: #e42f25b6"
            
          @click="resetBtn"
        > 重設
        </el-button>
      </el-form-item>
    </el-form>
    <!-- 表格 -->
    <el-table :height="tableHeight" :data="tableData" border stripe>
      <el-table-column type="selection" width="40"/>
      <el-table-column prop="bookName" label="書本名稱" width="130"/>
      <el-table-column prop="bookPlaceNum" label="書本編號"/>
      <el-table-column prop="username" label="名稱"/>
      <el-table-column prop="phone" label="電話" width="110"/>
      <el-table-column prop="borrowTime" label="借書時間" width="100"/>
      <el-table-column prop="returnTime" label="還書時間" width="100"/>
      <!--      <el-table-column prop="applyText" label="審核備註"></el-table-column>-->
      <el-table-column prop="excepionText" label="還書備註"/>
      <el-table-column
        prop="borrowStatus"
        label="借書狀態"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.borrowStatus == '0'"
            type="danger"
          >審核中
          </el-tag>
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
      <el-table-column
        prop="timeStatus"
        label="到期狀態"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.timeStatus == '1'" type="danger">到期</el-tag>
          <el-tag
            v-if="scope.row.timeStatus == '0'"
            type="success"
          >未到期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="applyStatus"
        label="審核狀態"
        align="center"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.applyStatus == '0'"
            type="danger"
          >待審核
          </el-tag>
          <el-tag
            v-if="scope.row.applyStatus == '1'"
            type="success"
          >已審核
          </el-tag>
          <el-tag
            v-if="scope.row.applyStatus == '2'"
            type="danger"
          >拒絕
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column  label="操作" fixed="right"  width="200">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.applyStatus == '0'"
            v-permission="['sys:borrowLook:apply']"
              
            type="primary"
             
            @click="applyBtn(scope.row)"
          > 同意借閱
          </el-button>
          <el-button
            v-if="scope.row.borrowStatus == '1'"
            v-permission="['sys:borrowLook:addTime']"
              
            type="primary"
             
            @click="addTimeBtn(scope.row)"
          > 續約
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分頁 -->
    <el-pagination
      :current-page.sync="lookParm.currentPage"
      :page-sizes="[8, 20, 40, 80, 100]"
      :page-size="lookParm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="lookParm.total"
      background
      @size-change="sizeChange"
      @current-change="currentChange"
    />
    <!-- 續約彈框 -->
    <sys-dialog
      :title="dialog.title"
      :visible="dialog.visible"
      :width="dialog.width"
      :height="dialog.height"
      @onConfirm="onConfirm"
      @onClose="onClose"
    >
      <div slot="content">
        <el-form
          ref="addTime"
          :model="addTime"
          :rules="rules"
          label-width="80px"
          :inline="false"
           
        >
          <el-form-item prop="returnTime" label="還書時間">
            <el-date-picker
              v-model="addTime.returnTime"
              type="date"
              placeholder="選擇還書時間"
            />
          </el-form-item>
        </el-form>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from '@/components/dialog/SysDialog.vue'
import { getUserId } from '@/utils/auth'
import { getLookBorrowListApi, applyBookApi, addTimeApi } from '@/api/borrow'

export default {
  components: {
    SysDialog
  },
  data() {
    return {
      rules: {
        addTime: [
          { required: true, message: '請選擇還書時間', trigger: 'blur' }
        ]
      },
      addTime: {
        borrowId: '',
        returnTime: ''
      },
      dialog: {
        title: '借書續期',
        visible: false,
        width: 650,
        height: 150
      },
      tableHeight: 0,
      tableData: [],
      applytions: [
        {
          value: '0',
          label: '待審核'
        },
        {
          value: '1',
          label: '已審核'
        },
        {
          value: '2',
          label: '拒絕'
        }
      ],
      timetions: [
        {
          value: '1',
          label: '到期'
        },
        {
          value: '0',
          label: '未到期'
        }
      ],
      exceoptions: [
        {
          value: '1',
          label: '正常還書'
        },
        {
          value: '2',
          label: '異常還書'
        }
      ],
      options: [
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
      lookParm: {
        userId: getUserId(),
        total: 0,
        currentPage: 1,
        pageSize: 8,
        phone: '',
        bookName: '',
        applyStatus: '',
        borrowStatus: '',
        returnStatus: '',
        timeStatus: ''
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 250
    })
  },
  created() {
    this.getLookBorrowList()
  },
  methods: {
    onClose() {
      this.dialog.visible = false
    },
    onConfirm() {
      this.$refs.addTime.validate(async(valid) => {
        if (valid) {
          const res = await addTimeApi(this.addTime)
          if (res && res.code == 200) {
            this.$message.success(res.msg)
            this.getLookBorrowList()
            this.dialog.visible = false
          }
        }
      })
    },
    // 借書續期
    addTimeBtn(row) {
      console.log(row)
      this.addTime.borrowId = row.borrowId
      this.dialog.visible = true
    },
    async applyBtn(row) {
      console.log(row)
      const confirm = await this.$myconfirm('確定審核嗎?')
      if (confirm) {
        const res = await applyBookApi({ borrowId: row.borrowId })
        if (res && res.code == 200) {
          this.$message.success(res.msg)
          this.getLookBorrowList()
        }
      }
    },
    searchBtn() {
      this.getLookBorrowList()
    },
    resetBtn() {
      // 清空表單
      this.lookParm.phone = ''
      this.lookParm.bookName = ''
      this.lookParm.applyStatus = ''
      this.lookParm.borrowStatus = ''
      this.lookParm.returnStatus = ''
      this.lookParm.timeStatus = ''
      this.getLookBorrowList()
    },
    currentChange(val) {
      this.lookParm.currentPage = val
      this.getLookBorrowList()
    },
    sizeChange(val) {
      this.lookParm.pageSize = val
      this.getLookBorrowList()
    },
    async getLookBorrowList() {
      const res = await getLookBorrowListApi(this.lookParm)
      if (res && res.code == 200) {
        this.tableData = res.data.records
        this.lookParm.total = res.data.total
      }
    }
  }
}
</script>

<style>
</style>
