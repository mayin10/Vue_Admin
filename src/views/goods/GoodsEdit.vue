<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"/>

      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品标签"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="保存数据"></el-step>
      </el-steps>

      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="180px"  >
       <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">

         <el-tab-pane label="基本信息" name="0">

            <el-form-item label="商品名称" prop="name">
              <el-input v-model="editForm.name"></el-input>
            </el-form-item>
            <el-form-item label="商品英文名称">
              <el-input v-model="editForm.name_en"></el-input>
            </el-form-item>
            <el-form-item label="商品关键字" >
              <el-input v-model="editForm.keywords"></el-input>
            </el-form-item>
            <el-form-item label="商品税率" >
              <el-input v-model="editForm.vat"></el-input>
            </el-form-item>

             <el-form-item label="是否上架" >
               <el-switch v-model="editForm.status"/>
             </el-form-item>

         </el-tab-pane>
         <!-- 商品标签 -->
         <el-tab-pane label="商品标签" name="1">

           <el-form-item label="规格模型">
                  <el-input v-model="editForm.type_name" :disabled="true"></el-input>
           </el-form-item>

           <el-form-item label="商品品牌">
                  <el-input v-model="editForm.brand_name" :disabled="true"></el-input>
           </el-form-item>

           <el-form-item label="商品分类">
                  <el-input v-model="editForm.group_name" :disabled="true"></el-input>
           </el-form-item>

             <div v-for="(item,index) in tagList" :key="index">
               <el-form-item :label="item.label" >
                 <el-checkbox-group v-model="editForm.tagCheckList">
                   <el-checkbox v-for="(item1,index1) in item.data" :key="index1"
                   :label="item1.id">{{item1.name}}</el-checkbox>
                 </el-checkbox-group>
               </el-form-item>
             </div>
         </el-tab-pane>


         <el-tab-pane label="商品内容" name="2">
            <quill-editor v-model="editForm.detail"></quill-editor>
         </el-tab-pane>


         <el-tab-pane label="商品图片" name="3">

            <el-form-item label="商品LOGO(100*100)">
              <div>只可以上传一张图片</div>
              <imgUpload :type ="type1" :fileList="editForm.goods_logo_in" @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
            </el-form-item>
            <el-form-item label="商品COVER(200*200)">
              <div>只可以上传一张图片</div>
               <imgUpload :type ="type2" :fileList="editForm.goods_cover_in" @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
            </el-form-item>

        <el-form-item label="商品轮播图(800*800)">
          <div>最多可以上传4张图片</div>
           <imgUpload :type ="type3" :fileList="editForm.goods_lunbo_in" @updateImgUrl = "updateImgUrl"  @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="商品详情图(800*800)">
          <div>最多可以上传10张图片</div>
           <imgUpload :type ="type4" :fileList="editForm.goods_detail_in" @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

         </el-tab-pane>


         <el-tab-pane label="保存数据" name="4">
              <el-button type="primary" class="btnAdd" @click="editGood">保存数据</el-button>
         </el-tab-pane>


       </el-tabs>



      </el-form>

    </el-card>

   </div>
</template>

<script>
  import imgUpload from "../../components/img-upload.vue"
  export default {
     components:{imgUpload},
    data() {
      return {
         goods_id:'',
         type1:'logo',
         type2:'cover',
         type3:'lunbo',
         type4:'detail',

         activeIndex: '0',

         mouldList:[{key: 1,label:'以件计算'},{key:2,label:'以重量计算'},{key: 3,label:'以体积计算'}],
         editForm:{},
         cateList: [],
         tagList: [],

         editFormRules: {
           name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
          },

      }
    },
    created() {
      this.goods_id = window.sessionStorage.getItem('goods_id')
      this.getGoods()
      this.getCateList()
      this.getTagList()
      },

    methods: {
       async getGoods() {
        const { data: res } = await this.$http.get('apiGoods/' + this.goods_id)
          if (res.code !== 200) {return this.$message.error(res.msg)}
             this.editForm = res.data
          },

        async getTagList() {
          const { data: res } = await this.$http.get('apiTagArray', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.tagList = res.data
        },

        async getCateList() {
          const { data: res } = await this.$http.get('apiCategoryList', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.cateList = res.data
        },

        beforeTabLeave(activeName, oldActiveName) {

        },

        updateImgUrl(img, imgList,type){
          if(type == 'logo'){
            this.editForm.goods_logo = img
          } else if (type == 'cover'){
            this.editForm.goods_cover = img
          } else if (type == 'lunbo'){
            this.editForm.goods_lunbo = imgList
          } else if(type == 'detail')
              this.editForm.goods_detail = imgList
        },

        imgRemove(ids,temp){
           this.editForm.goods_Imgs_remove = ids
           if(temp != ''){
              const {data: res} =  this.$http.post('apiDelImg', {path: temp})
           }
         },

        editGood() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('apiGoods/' + this.editForm.id,this.editForm)
            if (res.code !== 200) {return this.$message.error(res.msg)}
            this.$message.success('添加商品成功！')
            this.$router.push('/goodsList')

          })
        },


    },

    computed: {

    },

  }
</script>

<style lang="less" scoped>

</style>
