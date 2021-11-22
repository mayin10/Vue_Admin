<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>我的店铺</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>

        <el-form  :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="180px">
          <el-form-item label="店铺名称" prop="name_cn">
            <el-input v-model="addForm.name_cn" :disabled="inputDisabled"></el-input>
          </el-form-item>

          <el-form-item label="店铺名称(本地语言)">
            <el-input v-model="addForm.name_de" :disabled="inputDisabled"></el-input>
          </el-form-item>

          <el-form-item label="店铺负责人" prop="principal">
            <el-input v-model="addForm.principal" :disabled="inputDisabled"></el-input>
          </el-form-item>

          <el-form-item label="联系电话" prop="tel">
            <el-input v-model="addForm.tel" :disabled="inputDisabled"></el-input>
          </el-form-item>


          <el-form-item label="客服微信" prop="weixin">
            <el-input v-model="addForm.weixin" :disabled="inputDisabled"></el-input>
          </el-form-item>

          <el-form-item label="客服Email" >
            <el-input v-model="addForm.email" :disabled="inputDisabled"></el-input>
          </el-form-item>


          <el-form-item label="店铺LOGO(150*150)">
            <imgUpload v-if = "!inputDisabled" :fileList="addForm.imgFileList" @updateImgUrl = "updateImgUrl"/>
            <el-image v-if = "inputDisabled" style="width: 100px; height: 100px" :src="addForm.wls_img"/>

          </el-form-item>

            <el-form-item label="店铺简介">
                <el-input type="textarea" v-model="addForm.desc" :disabled="inputDisabled"></el-input>
            </el-form-item>
            <el-form-item label="店铺简介(本地语言):">
                <el-input type="textarea" v-model="addForm.desc_de" :disabled="inputDisabled"></el-input>
            </el-form-item>

             <el-form-item>
                <el-button type="warning" @click="editShop">{{uploadBtnLabel}}</el-button>
                <el-button type="primary" @click="addShop"  :disabled="inputDisabled">保存信息</el-button>
              </el-form-item>
            </el-form>

    </el-card>


    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="80%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>
  import imgUpload from "../../components/img-upload.vue"
   export default {
     components:{
     	imgUpload
     },
     data() {
       return {
         myShop:null,
         inputDisabled:false,
         addForm: {
                name_cn: '',
                name_de: '',

                principal:'',
                tel:'',
                weixin:'',
                email:'',
                shop_status:1,
                delivery_address_id:0,

                wls_img:'',
                imgFileList: [],
                desc:'',
                desc_de:'',
                   },


             addFormRules: {
               name_cn: [{ required: true, message: '请输入商品名称', trigger: 'blur' },
                         {min: 3, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
               principal: [{ required: true, message: '请输入商品名称', trigger: 'blur' },
                         {min: 3, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
               tel: [{ required: true, message: '请输入商品名称', trigger: 'blur' },
                         {min: 3, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
               weixin: [{ required: true, message: '请输入商品名称', trigger: 'blur' },
                         {min: 3, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }],
             },

           imageUrl: '',
           limitImg:3,
           uploadURL: 'http://devmatch.wlsphoenix.de/apiUpload',
           headerObj: { Authorization: window.sessionStorage.getItem('token')},
           previewPath: '',
           previewVisible: false,

       }
     },
     created() {
       this.getShop()
     },
     onShow: function() {
     	console.log('App Show')
      this.getShop()
     },

     computed:{
      uploadBtnLabel() {
        return this.inputDisabled?"修改信息":"取消改动"
      },
     },
      methods: {
        async getShop() {
          const { data: res } = await this.$http.get('apiMyShop')
          if (res.code == 200) {
            this.myShop = res.data
            this.init(this.myShop)
          }
        },


       init(myShop){
           this.addForm = myShop
           this.imgFileList = myShop.imgFileList
           this.inputDisabled = true
       },

        editShop(){
          this.inputDisabled = !this.inputDisabled
          if(this.inputDisabled){
             this.init(this.myShop)
          }
        },

        updateImgUrl(imageUrl){
          console.log(imageUrl)
            this.addForm.wls_img = imageUrl
        },

       addShop() {
            this.$refs.addFormRef.validate(async valid => {
              if (!valid) return
             if(this.myShop == null){
               const { data: res1 } = await this.$http.post('apiShops', this.addForm)
                  if (res1.code !== 200) {return this.$message.error('保存店铺信息失败！')}
             } else{
                const { data: res2 } = await this.$http.put('apiShops/'+ this.myShop.id, this.addForm)
                if (res2.code !== 200) {return this.$message.error('保存店铺信息失败！')}
             }
              this.$message.success('保存店铺信息成功！')
              this.getShop()
            })
          },
      }
   }
</script>

<style lang="less" scoped>


</style>
