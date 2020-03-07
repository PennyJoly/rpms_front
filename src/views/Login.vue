<template>
  <div class="back">
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">欢迎登录系统</h3>
    <el-form-item prop="account">
     <el-input prefix-icon="el-icon-user-solid" type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input prefix-icon="el-icon-s-opportunity" type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit2" :loading="logining">登录</el-button>
      <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
    </el-form-item>
  </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        logining: false,
        ruleForm2: {
          account: 'admin',
          checkPass: '1'
        },
        rules2: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            //{ validator: validaePass }
          ],
          checkPass: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            //{ validator: validaePass2 }
          ]
        },
        checked: true
      };
    },
    methods: {
      handleReset2() {
        this.$refs.ruleForm2.resetFields();
      },
      handleSubmit2(ev) {
        var _this = this;
        //验证表单信息
        this.$refs.ruleForm2.validate((valid) => {
          if (valid) {
            this.logining = true;
            var loginParams = { name: this.ruleForm2.account, password: this.ruleForm2.checkPass };
            //登录请求
            this.$http.post("/login",loginParams).then(res=>{
              this.logining = false;
              let { msg, success, resultObject} = res.data;
              //登陆失败
              if (!success) {
                this.$message({
                  message: msg,
                  type: 'error'
                });
              } else {
                sessionStorage.setItem('user', JSON.stringify(resultObject.user));
                //设置请求头
                sessionStorage.setItem('token', resultObject.token);
                //设置页面跳转
                this.$router.push({ path: '/' });
                this.$notify({
                  title: '成功',
                  message: '登陆成功',
                  type: 'success',
                  offset: 100
                });
              }
            });
          } else {
            return false;
          }
        });
      }
    }
  }

</script>

<style lang="scss" scoped>
 .back{
   width:100%;
   height:100%;
   background-image: linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%);
   /*background-image: linear-gradient(to top, #fff1eb 0%, #ace0f9 100%);*/
 /*  background-image: linear-gradient(to top, #9795f0 0%, #fbc8d4 100%);*/
  }
  .login-container {
    box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    /*margin: 180px auto;*/
    position: absolute;
    margin-left: 37%;
    margin-top: 11%;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
  }
</style>