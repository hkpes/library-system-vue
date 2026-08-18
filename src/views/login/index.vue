<template>
  <div class="logincontainer">
    <div class="login_box">
      <div>
        <el-form ref="loginForm" class="loginForm" :model="loginForm" :rules="rules" label-width="80px" :inline="false"
          size="normal">
          <el-form-item>
            <div>
              <img src="@/assets/images/logo.png" style="
                    width: 45px;
                    margin: 5px 10px -8px 0;
                    -webkit-user-drag: none;
                    -khtml-user-drag: none;
                    -moz-user-drag: none;
                    user-drag: none;
                " />
              <span class="loginTitle">HKPES圖書館</span>
            </div>
          </el-form-item>
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="請輸入會員電話/管理員名稱">
              <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="請輸入密碼">
              <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
            </el-input>
          </el-form-item>
          <el-form-item prop="userType">
            <el-radio-group v-model="loginForm.userType">
              <el-radio :label="0">會員</el-radio>
              <el-radio :label="1">管理員</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-row :gutter="20">
              <el-col :span="24" :offset="0">
                <el-button type="primary" class="mybtn" size="medium" :disabled="loading"
                  style="width:100%;background-color: #0782c2" @click="onSubmit">
                  <span v-if="!loading"> 登 入</span>
                  <span v-else> 登 入 中...</span>
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item>
            <span style="color: #1d2123;float: right;margin-right: 15px;cursor: pointer;"
              @click="registerBtn">會員註冊</span>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- 註冊彈框 -->
    <sys-dialog :title="dialog.title" :width="dialog.width" :height="dialog.height" :visible="dialog.visible"
      @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form ref="addRef" :model="addModel" :rules="registeRules" label-width="80px" style="margin-right: 30px">
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="phone" label="電話">
                <el-input v-model="addModel.phone" maxlength="11" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="username" label="姓名">
                <el-input v-model="addModel.username" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="email" label="電郵">
                <el-input v-model="addModel.email" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="password" label="密碼">
                <el-input v-model="addModel.password" type="password" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" :offset="0">
              <el-form-item prop="confirmPassword" label="確認密碼">
                <el-input v-model="addModel.confirmPassword" type="password" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="性別">
                <el-radio-group v-model="addModel.sex">
                  <el-radio :label="'0'">男</el-radio>
                  <el-radio :label="'1'">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>
  </div>
</template>

<script>
import { setUserType } from '@/utils/auth'
import { registerApi } from '@/api/reader'
import SysDialog from '@/components/dialog/SysDialog.vue'
export default {
  components: {
    SysDialog
  },
  data() {
    return {
      registeRules: {
        username: [{ required: true, message: '請填寫姓名', trigger: 'blur' }],
        email: [ 
          { required: true, message: '請填寫電郵', trigger: 'blur' }, 
          { type: 'email', message: '請輸入正確的電郵格式', trigger: ['blur', 'change'] } ],
        phone: [{ pattern: /^[2-9]\d{7}$/, required: true, message: '請輸入正確的手機號碼', trigger: 'blur' }],
        password: [{ required: true, message: '請填寫密碼', trigger: 'blur' }],
        confirmPassword: [
          { required: true, message: '請填寫確認密碼', trigger: 'blur' }
        ]
      },
      // 表單屬性
      addModel: {
        type: '',
        readerId: '',
        username: '',
        email: '',
        sex: '',
        phone: '',
        password: '',
        confirmPassword: '',
      },
      loading: false,
      dialog: {
        title: '會員註冊',
        width: 650,
        height: 250,
        visible: false
      },
      // 登入表單綁定資料來源
      loginForm: {
        username: '',
        password: '',
        userType: '' // 0：會員  1： 管理員
      },
      // 表單驗證規則
      rules: {
        username: [
          {
            trigger: 'change',
            required: true,
            message: '請輸入用戶名/會員電話'
          }
        ],
        password: [
          {
            trigger: 'change',
            required: true,
            message: '請輸入密碼'
          }
        ],
        userType: [
          {
            trigger: 'change',
            required: true,
            message: '請選擇用戶類別'
          }
        ]
      }
    }
  },
  methods: {
    onClose() {
      this.dialog.visible = false
    },
    onConfirm() {
      if (this.addModel.confirmPassword != this.addModel.password) {
        this.$message.warning('兩次密碼不一致!')
        return
      }
      this.$refs.addRef.validate(async (valid) => {
        if (valid) {
          const res = await registerApi(this.addModel)
          if (res && res.code == 200) {
            this.$message.success(res.msg)
            this.dialog.visible = false
          }
        }
      })
    },
    // 會員註冊
    registerBtn() {
      // 清空表單
      this.$resetForm('addRef', this.addModel)
      this.dialog.visible = true
    },
    // 登入提交事件 
    onSubmit() {
      // 表單驗證
      this.$refs.loginForm.validate((valid) => {
        // 驗證通過才提交表單
        if (valid) {
          this.loading = true
          setUserType(this.loginForm.userType)
          // 呼叫store裡面的login方法
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              // 跳轉路由
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            })
            .catch((e) => {
              this.loading = false
              console.log(e);
              if (
                e.response == undefined ||
                e.response.data == undefined
              ) {
                this.$message({
                  showClose: true,
                  message: e,
                  type: "error",
                  duration: 20000,
                });
              } else {
                this.$message({
                  showClose: true,
                  message: e.response.data,
                  type: "error",
                  duration: 20000,
                });
              }
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.logincontainer {
  height: 100%;
  background: #fff;
  background-image: url("../../assets/images/background.jpg");
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
}

.loginForm {
  height: 410px;
  width: 400px;
  background: #fff;
  padding: 35px 20px;
  border-radius: 10px;
}

.loginTitle {
  font-size: 34px;
  font-weight: 600;
  color: black;
}

.login_box {
  /* background-color: #fff; */
  background-color: white;
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  position: absolute;
  left: 50%;
  top: 50%;
  text-align: center;

  transform: translate(-50%, -50%);
}

.logincontainer ::v-deep .el-form-item__content {
  margin-left: 0px !important;
}

.mybtn {
  width: 100%;
}
</style>
