<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图 -->
    <el-card>
      <el-alert title="商品分类必须选第二级分类" type="warning" center show-icon :closable="false"/>

      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品标签"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="保存数据"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="180px"  >
       <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave">
         <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="addForm.name"></el-input>
            </el-form-item>
            <el-form-item label="商品英文名称" prop="name_en">
              <el-input v-model="addForm.name_en"></el-input>
            </el-form-item>
            <el-form-item label="商品关键字" prop="keywords">
              <el-input v-model="addForm.keywords"></el-input>
            </el-form-item>
            <el-form-item label="商品税率" >
              <el-input v-model="addForm.vat"></el-input>
            </el-form-item>


            <el-form-item label="是否上架" >
              <el-switch v-model="addForm.status"/>
            </el-form-item>

         </el-tab-pane>
         <!-- 商品标签 -->
         <el-tab-pane label="商品标签" name="1">

            <el-form-item label="规格模型">
             <el-select v-model="addForm.type_id" placeholder="请选择规格模型">
               <el-option v-for="item in typeList" :key="item.id" :label="item.name" :value="item.id"/>
             </el-select>
           </el-form-item>

            <el-form-item label="商品品牌">
             <el-select v-model="addForm.brand_id" placeholder="请选择商品品牌">
               <el-option v-for="item in brandList" :key="item.id" :label="item.name" :value="item.id"/>
             </el-select>
           </el-form-item>

            <el-form-item label="商品分类">
              <el-cascader expand-trigger="hover" :options="groupList" :props="{label: 'cate_name',value: 'id', children: 'children',checkStrictly: true}"
                v-model="goods_group" @change="handleChange">
              </el-cascader>
            </el-form-item>

             <div v-for="(item,index) in tagList" :key="index">
               <el-form-item :label="item.label" >
                 <el-checkbox-group v-model="addForm.tagCheckList">
                   <el-checkbox v-for="(item1,index1) in item.data" :key="index1"
                   :label="item1.id">{{item1.name}}</el-checkbox>
                 </el-checkbox-group>
               </el-form-item>
             </div>
         </el-tab-pane>


         <el-tab-pane label="商品内容" name="2">
            <quill-editor v-model="addForm.detail"></quill-editor>
         </el-tab-pane>


         <el-tab-pane label="商品图片" name="3">

            <el-form-item label="商品LOGO(100*100)">
              <div>只可以上传一张图片</div>
              <imgUpload :type ="type1" @updateImgUrl = "updateImgUrl"  @imgRemove = "imgRemove"/>
            </el-form-item>
            <el-form-item label="商品COVER(200*200)">
              <div>只可以上传一张图片</div>
               <imgUpload :type ="type2" @updateImgUrl = "updateImgUrl"  @imgRemove = "imgRemove"/>
            </el-form-item>

            <el-form-item label="商品轮播图(800*800)">
              <div>最多可以上传4张图片</div>
               <imgUpload :type ="type3"  @updateImgUrl = "updateImgUrl"  @imgRemove = "imgRemove"/>
            </el-form-item>

            <el-form-item label="商品详情图(800*800)">
              <div>最多可以上传10张图片</div>
               <imgUpload :type ="type4"  @updateImgUrl = "updateImgUrl"  @imgRemove = "imgRemove"/>
            </el-form-item>

         </el-tab-pane>


         <el-tab-pane label="保存数据" name="4">
              <el-button type="primary" class="btnAdd" @click="addGood">保存数据</el-button>
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
         type1:'logo',
         type2:'cover',
         type3:'lunbo',
         type4:'detail',
         manyTableData: [],
         activeIndex: '0',

         addForm:
         {
            name: '',
            name_en: '',
            keywords: '',
            vat: 19,
            status:true,
            type_id: '',
            brand_id:'',
            group_id: '',
            tagCheckList: [],
            detail: '',
            goods_logo:[],
            goods_cover:[],
            goods_lunbo:[],
            goods_detail:[],

         },

          goods_group: [],
          mouldList:[{key: 1,label:'以件计算'},{key:2,label:'以重量计算'},{key: 3,label:'以体积计算'}],
          typeList: [],
          brandList: [],
          groupList: [],
          tagList: [],

          addFormRules: {
            name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
            name_en: [{ required: true, message: '请输入商品英文名', trigger: 'blur' }],
            keywords: [{ required: true, message: '请输入商品关键字', trigger: 'blur' }],
          },

      }
    },
    created() {
        this.getTypeList()
        this.getBrandList()
        this.getGroupList()
        this.getTagList()
        this.getTagCheckList()
      },

    methods: {
        async getTagList() {
          const { data: res } = await this.$http.get('apiTagArray', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.tagList = res.data
        },

        async getTagCheckList() {
          const { data: res } = await this.$http.get('apiTagCheckArray', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.addForm.tagCheckList = res.data
        },

        async getTypeList() {
          const { data: res } = await this.$http.get('apiTypeList', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.typeList = res.data
        },

        async getBrandList() {
          const { data: res } = await this.$http.get('apiBrandList', {})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.brandList = res.data
        },

        async getGroupList() {
          const { data: res } = await this.$http.get('parentList', {params: {type:2}})
          if (res.code !== 200) { return this.$message.error(res.msg)}
          this.groupList = res.data
        },

      // 级联选择器选中项变化，会触发这个函数
      handleChange() {
        if(this.goods_group.length == 1){
            this.addForm.group_id = this.goods_group[0]
        }
        if(this.goods_group.length == 2){
            this.addForm.group_id = this.goods_group[1]
        }

        console.log(this.addForm.group_id)
        /*
        this.addForm.group_id = this.goods_group[1]
        if (this.goods_group.length !== 2) {
          this.goods_group = []
        } else{
          console.log( this.addForm.group_id)
          this.addForm.group_id = this.goods_group[1]
        }*/




      },

       beforeTabLeave(activeName, oldActiveName) {
         if (oldActiveName === '0' && this.addForm.name == '') {
               this.$message.error('商品名称不能为空')
               return false
          }
        if (oldActiveName === '1' && this.addForm.group_id == '') {
               // this.$message.error('请选择规格模型！')
                return true
            }
        if (oldActiveName === '1' && this.addForm.cate_id == '') {
                this.$message.error('请选择商品分类！')
                return false
            }
            if (oldActiveName === '1' && this.addForm.brand_id == '') {
                    this.$message.error('请选择商品品牌！')
                    return false
                }
        },

        async tabClicked() {

        },

        imgRemove(ids,temp){
           if(temp != ''){
              const {data: res} =  this.$http.post('apiDelImg', {path: temp})
           }
         },

        updateImgUrl(img, imgList,type){
          if(type == 'logo'){
            this.addForm.goods_logo = img
          } else if (type == 'cover'){
            this.addForm.goods_cover = img
          } else if (type == 'lunbo'){
            this.addForm.goods_lunbo = imgList
          } else if(type == 'detail')
              this.addForm.goods_detail = imgList
        },

        addGood() {
          this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.post('apiGoods', this.addForm)
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
