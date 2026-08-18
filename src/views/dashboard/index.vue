<template>
  <el-main>
    <div id="title">
      數據統計
    </div>
    <hr>
    <div style="display: flex">
      <div id="main2" style="width: 350px; height: 300px; flex-grow: 1"></div>
      <div id="main1" style="width: 550px; height: 300px; flex-grow: 2"></div>
    </div>

    <!-- 管理員統計 -->
    <el-row :gutter="20" type="flex" class="row-bg" justify="center" style="margin-bottom: 80px">
      <el-col :span="6">
        <div class="show-header" style="background: rgb(0,191,255)">
          <div class="show-num">{{ readerCount }}</div>
          <div class="bottom-text"> 會員總數</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="show-header" style="background: rgb(100,149,237)">
          <div class="show-num">{{ applyReader }}</div>
          <div class="bottom-text"> 會員待審核</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="show-header" style="background: rgb(60,179,113)">
          <div class="show-num">{{ borrowApplyCount }}</div>
          <div class="bottom-text"> 借書待審核</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="show-header" style="background: rgb(237, 64, 20)">
          <div class="show-num">{{ borrowReturnCount }}</div>
          <div class="bottom-text"> 到期待還書</div>
        </div>
      </el-col>
    </el-row>
    <el-card class="box-card" style="margin-top: 30px">
      <div slot="header" class="announcement">
        <span style="color: #000000; font-weight: 600"> 公告</span>
      </div>
      <div v-for="o in noticeList" :key="o.noticeId" class="text item">
        <span style="font-weight:600;font-size:14px;">{{ o.noticeTitle }}</span><span
          style="margin-left:30px;font-size:14px">{{ o.noticeContent }}</span>
        <el-divider></el-divider>
      </div>
    </el-card>
  </el-main>
</template>

<script>
import { getUserType, getUserId } from '@/utils/auth'
import { getReaderCountApi, getApplyReaderCountApi } from '@/api/reader'
import { getBorrowApplyCountApi, getBorrowReturnCountApi } from '@/api/borrow'
import { categoryCountApi } from '@/api/category'
import { getHotBookApi } from '@/api/book'
import { getTopListApi } from '@/api/notice'
import { getListApi } from '@/api/role'

export default {
  name: 'Dashboard',
  data() {
    return {
      readerCount: 0,
      applyReader: 0,
      borrowApplyCount: 0,
      borrowReturnCount: 0,
      noticeList: [],
      roleType: '',
      tableData: [],
      // 角色id
      roleId: ''
    }
  },
  mounted() {
    this.myechert1()
    this.myechert2()
    this.getReaderCount()
    this.getApplyReaderCount()
    this.getBorrowApplyCount()
    this.getBorrowReturnCount()
    this.getNoticeList()
  },
  methods: {
    async getNoticeList() {
      let res = await getTopListApi()
      if (res && res.code == 200) {
        console.log('公告')
        console.log(res)
        this.noticeList = res.data
      }
    },
    async getBorrowReturnCount() {
      let res = await getBorrowReturnCountApi({
        userType: getUserType(),
        userId: getUserId()
      })
      console.log(res)
      if (res && res.code == 200) {
        this.borrowReturnCount = res.data
      }
    },
    async getBorrowApplyCount() {
      let res = await getBorrowApplyCountApi({
        userType: getUserType(),
        userId: getUserId()
      })
      console.log(res)
      if (res && res.code == 200) {
        this.borrowApplyCount = res.data
      }
    },
    async getReaderCount() {
      let res = await getReaderCountApi()
      console.log(res)
      if (res && res.code == 200) {
        this.readerCount = res.data
      }
    },
    async getApplyReaderCount() {
      let res = await getApplyReaderCountApi()
      console.log(res)
      if (res && res.code == 200) {
        this.applyReader = res.data
      }
    },
    async myechert1() {
      // 基於準備好的dom，初始化echarts實例
      var myChart = this.$echarts.init(document.getElementById('main1'))

      // 指定圖表的配置項目和數據
      var option = {
        title: {
          text: '書本分類統計'
        },
        xAxis: {
          data: [],
          axisLabel: {
            show: true,
            interval: 0,
            formatter: function (value) {
              // 用空格分開中文同英文部分
              const spaceIndex = value.indexOf(' ')
              if (spaceIndex === -1) {
                // 冇空格,即係冇英文部分,直接顯示原文
                return value
              }
              const zh = value.substring(0, spaceIndex)
              const en = value.substring(spaceIndex + 1)
              // 英文超過 6 個字母就每個字母分行,否則保持完整一行
              const enFormatted = en.length > 6 ? en.split(' ').join('\n') : en
              return zh + '\n' + enFormatted
            }
          }
        },
        yAxis: {},
        series: [
          {
            name: '數量',
            type: 'bar',
            data: []
          }
        ]
      }
      // 動態取得數據
      let res = await categoryCountApi()
      if (res && res.code == 200) {
        console.log('分類數據')
        console.log(res)
        const combined = res.data.names.map((name, index) => ({
          name,
          count: res.data.counts[index]
        }))
        const top5 = combined.sort((a, b) => b.count - a.count).slice(0, 5)
        option.xAxis.data = top5.map(item => item.name)
        option.series[0].data = top5.map(item => item.count)
      }
      // 使用剛指定的配置項和資料顯示圖表。
      myChart.setOption(option)
    },
    async myechert2() {
      // 基於準備好的dom，初始化echarts實例
      var myChart = this.$echarts.init(document.getElementById('main2'))

      // 指定圖表的配置項目和數據
      var option = {
        title: {
          text: '熱門書本排行榜',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '借閱次數',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: [],
            label: {
              show: true,
              formatter: '{b}'
            },
            emphasis: { 
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      // 動態獲取數據
      let res = await getHotBookApi()
      if (res && res.code == 200) {
        console.log('熱門書本')
        console.log(res)
        option.series[0].data = res.data
      }
      // 使用剛指定的配置項和資料顯示圖表。
      myChart.setOption(option)
    },
    // 獲取名單
    async getList() {
      const res = await getListApi(this.listParm)
      if (res && res.code == 200) {
        console.log(res)
        // 設置表格數據
        this.tableData = res.data.records
        this.listParm.total = res.data.total
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-text {
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.1);
  text-align: center;
  position: absolute;
  padding: 10px;
}

#title {
  height: 50px;
  font-size: 30px
}

.show-header {
  background: #00c0ef;
  color: #fff;
  height: 200px;
  border-radius: 5px;
  position: relative;
}

.show-num {
  font-size: 60px;
  font-weight: 600;
  padding: 40px 0 0 0;
  text-align: center;
}
</style>
