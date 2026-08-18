<template>
  <el-main>
    <!-- 會員信息 -->
    <div id="readerMsg">
       會員信息
    </div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-form :model="searchParm" label-width="80px" :inline="true">
          <el-form-item label="電話">
            <el-input v-model="searchParm.phone" />
          </el-form-item>
          <el-form-item>
            <el-button @click="getByUserName"> 查詢
            </el-button>
            <el-button style="color: #e42f25b6" @click="resetBtn"> 重設
            </el-button>
          </el-form-item>
          <el-form-item label="還書時間">
            <el-date-picker v-model="returnTime" type="date" placeholder="選擇還書時間" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="borrowBtn"> 借書
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="text item">
        <el-form :model="showUser" label-width="80px" :inline="true" :disabled="true">
          <el-form-item label="姓名">
            <el-input v-model="showUser.username" />
          </el-form-item>
          <el-form-item label="電話">
            <el-input v-model="showUser.phone" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio v-model="showUser.sex" label="0">男</el-radio>
            <el-radio v-model="showUser.sex" label="1">女</el-radio>
          </el-form-item>
          <el-form-item label="狀態">
            <el-radio v-model="showUser.checkStatus" label="0">未審核</el-radio>
            <el-radio v-model="showUser.checkStatus" label="1">已審核</el-radio>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!-- 書本名單 -->
    <div id="bookMsg">
       書本名單
    </div>
    <elt-transfer ref="eltTransfer" v-model="tableData" :show-query="true" :show-pagination="true"
      :pagination-call-back="paginationCallBack" :left-columns="leftColumns" :title-texts="['待選', '已選']"
      :button-texts="[' 添加', ' 刪除']" :query-texts="[' 查詢', ' 查詢']" :table-row-key="(row) => row.bookId">
      <!-- 可以使用插槽獲取到列資訊和行信息，從而進行資料的處理 -->
      <template v-slot:leftCondition="{ }">
        <el-form-item label="書本名稱">
          <el-input v-model="listParm.bookName" placeholder="書本名稱" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="listParm.bookAuther" placeholder="作者" />
        </el-form-item>
      </template>
      <template v-slot:rightCondition="{ scope }">
        <el-form-item label="名稱">
          <el-input v-model="scope.bookName" placeholder="書本名稱" />
        </el-form-item>
      </template>
    </elt-transfer>
  </el-main>
</template>

<script>
import { borrowApi } from '@/api/borrow'
import { getByPhoneApi } from '@/api/reader'
import { getListApi } from '@/api/book'
import { getCurrentUsername, getUserType } from '@/utils/auth'
import eltTransfer from 'elt-transfer/src/eltTransfer'

export default {
  // 註冊組件
  components: {
    'elt-transfer': eltTransfer
  },
  data() {
    return {
      returnTime: '',
      bookIds: [],
      // 書本名單分頁參數
      listParm: {
        currentPage: '',
        pageSize: '',
        bookName: '',
        bookAuther: ''
      },
      // 選擇的書本
      tableData: [],
      leftColumns: [
        { label: '書本名稱', id: 'bookName', width: '120px' },
        { label: '圖書分類', id: 'categoryName', width: '120px' },
        { label: '書本編號', id: 'bookPlaceNum' },
        { label: '作者', id: 'bookAuther' },
        { label: '出版社', id: 'bookProduct' },
        { label: '庫存', id: 'bookStore' }
      ],
      // 會員信息搜尋框
      searchParm: {
        phone: ''
      },
      showUser: {
        readerId: '',
        username: '',
        sex: '',
        phone: '',
        checkStatus: ''
      }
    }
  },
  methods: {
    // 借書按鈕
    async borrowBtn() {
      this.bookIds = []
      console.log(this.tableData)
      if (!this.returnTime) {
        this.$message.error('請選擇還書時間!')
        return
      }
      if (this.returnTime < new Date().getTime()) {
        this.$message.error('請選擇正確還書時間!')
        return
      }
      if (!this.showUser.readerId) {
        this.$message.error('請查詢借書人信息是否存在!')
        return
      }
      if (this.tableData.length < 1) {
        this.$message.error('請選擇要借的書本!')
        return
      }
      // 找到每个書本的id
      for (let i = 0; i < this.tableData.length; i++) {
        this.bookIds.push(this.tableData[i].bookId)
      }
      // 提交
      const parm = {
        readerId: this.showUser.readerId,
        bookIds: this.bookIds,
        returnTime: this.returnTime
      }
      const res = await borrowApi(parm)
      if (res && res.code == 200) {
        this.$message.success(res.msg)
        setTimeout(function () {
          window.location.reload()
        }, 3000)
      }
    },
    // 重設按鈕
    resetBtn() {
      this.searchParm.phone = ''
      this.showUser.readerId = ''
      this.showUser.username = ''
      this.showUser.sex = ''
      this.showUser.phone = ''
      this.showUser.checkStatus = ''
    },
    // 獲取會員信息
    async getByUserName() {
      // 校驗是否輸入了學號
      if (!this.searchParm.phone) {
        this.$message.warning('請輸入電話!')
        return
      }
      // 取得目前使用者類型，0：讀者，1：管理員
      const userType = getUserType()
      // 只有讀者角色才校驗學號是否為本人
      if (userType === '0') {
        // 取得目前登入使用者的學號
        const currentPhone = getCurrentUsername()
        // // 校驗輸入的學號是否為目前登入使用者的電話
        if (this.searchParm.phone !== currentPhone) {
          this.$message.error('只能查詢本人電話!')
          return
        }
      }
      const res = await getByPhoneApi(this.searchParm)
      if (res && res.code == 200 && res.data) {
        this.showUser = res.data
      }
    },
    async paginationCallBack(obj) {
      console.log(obj)
      this.listParm.currentPage = obj.pageIndex
      this.listParm.pageSize = obj.pageSize
      // 取得圖書數據
      const res = await getListApi(this.listParm)
      console.log(res)
      return new Promise((resolve, reject) => {
        try {
          resolve({ total: res.data.total, data: res.data.records })
        } catch {
          reject()
        }
      })
    },
    clearTransfer() {
      this.$refs.eltTransfer.clear()
    }
  }
}
</script>

<style scoped>
::v-deep .el-card__header {
  padding: 15px 0px 0px 0px;
}

::v-deep .el-card__body {
  padding: 15px 0px 0px 0px;
}


#readerMsg {
  margin: 0px 0px 15px 0px;
  color: #204110;
  font-size: 24px;
}

#bookMsg {
  margin: 15px 0px;
  color: #204110;
  font-size: 24px;
}
</style>
