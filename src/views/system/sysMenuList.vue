<template>
  <el-main>
    <el-form  >
      <el-form-item>
        <el-button
          v-permission="['sys:menu:add']"
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
      row-key="menuId"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="title" label="選單名稱"/>
      <el-table-column prop="title" label="選單圖標">
        <template slot-scope="scope">
          <i :class="scope.row.icon"/>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="選單類型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type == '0'">目錄</el-tag>
          <el-tag v-if="scope.row.type == '1'" type="success">選單</el-tag>
          <el-tag v-if="scope.row.type == '2'" type="danger">按鈕</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="路由名稱"/>
      <el-table-column prop="path" label="路由地址"/>
      <el-table-column prop="code" label="權限字段"/>
      <el-table-column  label="操作" fixed="right"  width="260">
        <template slot-scope="scope">
          <el-button
            v-permission="['sys:menu:edit']"
            type="primary"
              
             
            @click="editBtn(scope.row)"
          > 編輯會員
          </el-button>
          <el-button
            v-permission="['sys:menu:delete']"
            type="danger"
             
             
            @click="deleteBtn(scope.row)"
          > 刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新增、編輯 -->
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
           
          style="margin-right: 8px"
        >
          <el-row>
            <el-col :span="24" :offset="0">
              <el-form-item prop="type" label="選單類型">
                <el-radio-group v-model="addModel.type">
                  <el-radio :label="'0'">目錄</el-radio>
                  <el-radio :label="'1'">選單</el-radio>
                  <el-radio :label="'2'">按鈕</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="parentName" label="上級選單">
                <!-- <el-input type="hidden" v-model="addModel.parentId"></el-input> -->
                <el-input
                  v-model="addModel.parentName"
                  @click.native="selectParent"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="title" label="選單名稱">
                <el-input v-model="addModel.title"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col v-if="addModel.type != '2'" :span="12" :offset="0">
              <el-form-item label="選單圖標">
                <!-- <el-input v-model="addModel.icon"/> -->
                
                <el-select v-model="addModel.icon" placeholder="請選擇">
                  <el-option
                    v-for="item in icons"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  <i :class="item"> {{ item }}</i>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="addModel.type == '1'" :span="12" :offset="0">
              <el-form-item prop="name" label="路由名稱">
                <el-input v-model="addModel.name"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="addModel.type == '1'">
            <el-col :span="12" :offset="0">
              <el-form-item prop="path" label="路由地址">
                <el-input v-model="addModel.path"/>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item prop="url" label="組件路徑">
                <el-input v-model="addModel.url"/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item label="權限字段">
                <el-input v-model="addModel.code"/>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="選單序號">
                <el-input v-model="addModel.orderNum"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>
    <!-- 上級選單 -->
    <sys-dialog
      :title="parentDialog.title"
      :width="parentDialog.width"
      :height="parentDialog.height"
      :visible="parentDialog.visible"
      @onClose="parentClose"
      @onConfirm="parentConfirm"
    >
      <div slot="content">
        <el-tree
          ref="parentTree"
          :data="treeData"
          node-key="menuId"
          :props="defaultProps"
          empty-text="暫無數據"
          :show-checkbox="false"
          :highlight-current="true"
          default-expand-all
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <div slot-scope="{ node, data }">
            <!-- 如果没有下級，顯示文檔圖標 -->
            <span v-if="data.children.length == 0">
              <i style="margin-left: 3px" class="el-icon-document"/>
            </span>
            <!-- 有下级，判斷是否展開 -->
            <span v-else @click.stop="openBtn(data)">
              <i
                v-if="data.open"
                style="margin-left: 3px"
                class="el-icon-plus"
              />
              <i v-else style="margin-left: 3px" class="el-icon-minus"/>
            </span>
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from '@/components/dialog/SysDialog.vue'
import {
  getMenuListApi,
  getParentMenuListApi,
  addMenuApi,
  editMenuApi,
  deleteMenuApi
} from '@/api/menu'

export default {
  // 註冊組件
  components: {
    SysDialog
  },
  data() {
    return {
    icons: [
      "iconfont icon-r-home",
      "iconfont icon-r-setting",
      "iconfont icon-r-refresh",
      "iconfont icon-r-building",
      "iconfont icon-r-shield",
      "iconfont icon-r-paper",
      "iconfont icon-r-team",
      "iconfont icon-r-user1",
      "iconfont icon-r-user2",
      "iconfont icon-r-user3",
      "iconfont icon-r-mark1",
      "iconfont icon-r-mark2",
      "iconfont icon-r-mark3",
      "iconfont icon-r-mark4",
      "iconfont icon-r-yes",
      "iconfont icon-r-no",
      "iconfont icon-r-left",
      "iconfont icon-r-right",
      "iconfont icon-r-top",
      "iconfont icon-r-bottom",
      "iconfont icon-r-list",
      "iconfont icon-r-edit",
      "iconfont icon-r-add",
      "iconfont icon-r-delete",
      "iconfont icon-r-find"
    ],
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      // 上級選單數據
      treeData: [],
      // 上級彈框屬性
      parentDialog: {
        width: 300,
        title: '選擇上級選單',
        height: 450,
        visible: false
      },
      // 表單驗證規則
      rules: {
        type: [
          {
            trigger: 'blur',
            required: true,
            message: '請選擇選單類別'
          }
        ],
        parentName: [
          {
            trigger: 'blur',
            required: true,
            message: '請選擇上級選單'
          }
        ],
        title: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫選單名稱'
          }
        ],
        name: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫路由名稱'
          }
        ],
        path: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫路由地址'
          }
        ],
        url: [
          {
            trigger: 'blur',
            required: true,
            message: '請填寫組件路徑'
          }
        ]
      },
      // 表單數據
      addModel: {
        editType: '', // 0:新增 1：編輯
        menuId: '',
        type: '',
        parentId: '',
        title: '',
        code: '',
        name: '',
        path: '',
        url: '',
        icon: '',
        parentName: '',
        orderNum: ''
      },
      // 彈框屬性
      dialog: {
        width: 650,
        title: '',
        height: 280,
        visible: false
      },
      // 表格高度 
      tableHeight: 0,
      // 表格數據
      tableData: [],
      // 樹選擇的數據
      selectNode: {
        id: '',
        title: ''
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
    // 編輯
    editBtn(row) {
      // 設置彈框屬性
      this.dialog.title = '編輯選單'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      // 把要編輯的資料放到表單綁定的資料裡面,回顯
      this.$objCoppy(row, this.addModel)
      this.addModel.editType = '1'
    },
    // 刪除按鈕
    async deleteBtn(row) {
      const confirm = await this.$myconfirm('確定刪除該數據嗎?')
      if (confirm) {
        const res = await deleteMenuApi({ menuId: row.menuId })
        if (res && res.code == 200) {
          this.$message({ type: 'success', message: res.msg })
          this.getList()
        }
      }
    },
    // 上級部門節點加號和減號點擊事件
    openBtn(data) {
      data.open = !data.open
      this.$refs.parentTree.store.nodesMap[data.menuId].expanded = !data.open
    },
    // 上級選單樹點選事件
    handleNodeClick(node) {
      console.log(node)
      this.selectNode.id = node.menuId
      this.selectNode.title = node.title
    },
    // 上級選單确定事件
    parentConfirm() {
      this.addModel.parentId = this.selectNode.id
      this.addModel.parentName = this.selectNode.title
      this.parentDialog.visible = false
      console.log(this.addModel)
    },
    // 上級選單關閉事件
    parentClose() {
      this.parentDialog.visible = false
    },
    // 選擇上級選單事件
    async selectParent() {
      // 查詢上級選單數據庫
      const res = await getParentMenuListApi()
      if (res && res.code == 200) {
        this.treeData = res.data
      }
      this.parentDialog.visible = true
    },
    // 新增按鈕
    addBtn() {
      // 設置彈框属性 設置彈框屬性
      this.dialog.title = '新增菜單'
      this.dialog.visible = true
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      this.addModel.editType = '0'
    },
    // 彈框確定
    onConfirm() {
      this.$refs.addRef.validate(async(valid) => {
        if (valid) {
          let res = null
          if (this.addModel.editType == '0') {
            res = await addMenuApi(this.addModel)
          } else {
            res = await editMenuApi(this.addModel)
          }
          if (res && res.code == 200) {
            this.$message({ type: 'success', message: res.msg })
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
    async getList() {
      const res = await getMenuListApi()
      if (res && res.code == 200) {
        console.log(res)
        this.tableData = res.data
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-tree {
  // 將每一行的設定為相對定位 方便後面before after 使用絕對定位來固定位置
  .el-tree-node {
    position: relative;
    padding-left: 10px;
  }

  // 子集像右偏移 給數線留出距離
  .el-tree-node__children {
    padding-left: 20px;
  }

  //是豎線
  .el-tree-node :last-child:before {
    height: 40px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  //這自訂的線 的公共部分
  .el-tree-node:before,
  .el-tree-node:after {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .tree :first-child .el-tree-node:before {
    border-left: none;
  }

  // 豎線
  .el-tree-node:before {
    border-left: 1px dotted #d9d9d9;
    bottom: 0px;
    height: 100%;
    top: -25px;
    width: 1px;
  }

  //横線
  .el-tree-node:after {
    border-top: 1px dotted #d9d9d9;
    height: 20px;
    top: 14px;
    width: 24px;
  }

  .el-tree-node__expand-icon.is-leaf {
    width: 8px;
  }

  //去掉elementui自帶的展開按鈕 一個向下的按鈕,打開時向右
  .el-tree-node__content > .el-tree-node__expand-icon {
    display: none;
  }

  //每一行的高度
  .el-tree-node__content {
    line-height: 30px;
    height: 30px;
    padding-left: 10px !important;
  }
}

//去掉最上級的before after 即去電最上層的連接線
::v-deep .el-tree > div {
  &::before {
    display: none;
  }

  &::after {
    display: none;
  }
}
</style>
