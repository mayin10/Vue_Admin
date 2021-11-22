<template>
  <div>
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>商品管理</el-breadcrumb-item>
     <el-breadcrumb-item>商品标签</el-breadcrumb-item>
   </el-breadcrumb>

   <el-card>
       <el-row :gutter="20">
         <el-col :span="8">
           <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
             <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
           </el-input>
         </el-col>
         <el-col :span="4">
           <el-button type="primary" @click="showAddDialog">添加标签</el-button>
         </el-col>
       </el-row>
       <!-- 标签列表区域 -->
       <el-table :data="dataList" border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="标签名" prop="name"></el-table-column>
         <el-table-column label="类型" prop="type"></el-table-column>
         <el-table-column label="描述" prop="desc"></el-table-column>
         <el-table-column label="排序" prop="sort"></el-table-column>

         <el-table-column label="图片">
           <template slot-scope="scope">
             <el-image v-if ="scope.row.type =='swiper'"
              style="width: 200px; height: 100px" fit="contain" :src="scope.row.wls_img"/>
             <el-image v-if ="scope.row.type =='banner'"
                 style="width: 200px; height: 100px" fit="contain" :src="scope.row.wls_img"/>
             <el-image v-if ="scope.row.type =='tab1'"
                 style="width: 50px; height: 50px" fit="contain" :src="scope.row.wls_img"/>
           </template>
         </el-table-column>

         <el-table-column label="是否默认">
           <template slot-scope="scope">
             <el-switch v-model="scope.row.is_default" @change="changeDefault(scope.row)"/>
           </template>
         </el-table-column>
         <el-table-column label="操作" width="120px">
           <template slot-scope="scope">
             <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
             <el-button type="danger" icon="el-icon-delete" size="mini" @click="removById(scope.row.id)"></el-button>
           </template>
         </el-table-column>
       </el-table>
       <!-- 分页区域 -->
       <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
       :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
       </el-pagination>
   </el-card>


    <!-- 添加对话框 -->
    <el-dialog title="添加标签" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="150px">

        <el-form-item label="标签类型">
          <el-select v-model="addForm.type" placeholder="请选择标签类型"  @change="getAktType()">
            <el-option v-for="item in tagTypes" :key="item.name" :label="item.name" :value="item.name"/>
          </el-select>
        </el-form-item>

        <el-form-item label="标签名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="标签简介">
            <el-input type="textarea" v-model="addForm.desc" />
        </el-form-item>

        <el-form-item v-if="aktType.hasImg == 1" :label="imgLabel" >
           <div>只可以上传一张图片</div>
           <imgUpload :type ="imgType" :fileList="addForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="addForm.sort"/>
        </el-form-item>
        <el-form-item label="是否默认" >
          <el-switch v-model="addForm.is_default"/>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改标签" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="150px">
        <el-form-item label="标签类型" >
          <el-input v-model="editForm.type" disabled="" ></el-input>
        </el-form-item>
        <el-form-item label="标签名" prop="name">
          <el-input v-model="editForm.name" ></el-input>
        </el-form-item>

        <el-form-item label="标签简介">
            <el-input type="textarea" v-model="editForm.desc" />
        </el-form-item>

        <el-form-item v-if="aktType.hasImg == 1" :label="imgLabel">
          <div>只可以上传一张图片</div>
           <div>大小</div>
           <imgUpload :type ="imgType" :fileList="editForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="是否默认" >
          <el-switch v-model="editForm.is_default"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import imgUpload from "../../components/img-upload.vue"
   export default {
      components:{imgUpload},
     data() {
       return {
          queryInfo: {keyword: '', page: 1, pagesize: 5},
          dataList: [],
          total: 0,
          hasimg: ['swiper','banner','tab1'],
          imgType:'logo',
          tagTypes: [],
          aktType: {hasImg:0,imageW:0,imageH:0},
          addDialogVisible: false,
          addForm: {},
          formRules: {
            name: [{ required: true, message: '标签名称', trigger: 'blur' },
                   {min: 1,max: 50,message: '标签名称的长度在3~50个字符之间',trigger: 'blur'}],
          },
          editDialogVisible: false,
          editForm: {},

       }
     },
     computed:{
       imgLabel(){

         if(this.aktType.hasImg == 1){
           let w = this.aktType.imageW
           let h = this.aktType.imageH
            return  "标签图片(" + w + "*"+ h +")"
         }
          return '标签图片'
       }
     },

      created() {
        this.getDataList()
        },
      methods: {

        getAddForm(){
          this.addForm =  {
            type: '',
            name: '',
            desc:'',
            sort:'50',
            is_default:true,
            wls_img_in:[],
            wls_img:[],
            wls_img_remove:[]
            }
        },

        async getDataList() {
          const { data: res } = await this.$http.get('apiTag', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error('获取用户列表失败！')
          }
          this.dataList = res.data.data
          this.dataList.forEach(function (item, index) {
             item.is_default = item.is_default==1? true: false
          });
          this.total = res.data.total
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getDataList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getDataList()
        },


        async changeDefault(tag) {
          const {data: res} = await this.$http.post('apiTagDefault', {id: tag.id, is_default: tag.is_default?1:0})
          if (res.code !== 200) {
            tag.is_defaults = !tag.is_default
             return this.$message.error(res.msg)
            }
          this.$message.success('更新数据状态成功！')
          this.getDataList()
        },


      showAddDialog(){
        this.addDialogVisible = true
        this.getAddForm()
        this.getTagTypes()
      },

       async getTagTypes() {
         const { data: res } = await this.$http.get('apiTagTypes', {})
         if (res.code !== 200) { return this.$message.error(res.msg)}
         this.tagTypes = res.data
        },


        getAktType(){
          if(this.addForm.type != ''){
             this.aktType =  this.tagTypes[this.addForm.type]
          }
        },



        updateImgUrl(img, imgList,type){
          if(this.addDialogVisible){
            this.addForm.wls_img = img
          } else if (this.editDialogVisible){
            this.editForm.wls_img = img
          }
        },

        imgRemove(ids,temp){
         if(temp != ''){
             const {data: res} =  this.$http.post('apiDelImg', {path: temp})
          }
        if (this.editDialogVisible){
             this.editForm.wls_img_remove = ids
             }
         },

        addDialogClosed() {
          this.getAddForm()
        },

       add() {
            this.$refs.addFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.post('apiTag', this.addForm)
              if (res.code !== 200) {this.$message.error(res.msg)}
              this.$message.success('添加数据成功！')
              this.addDialogVisible = false
              this.getDataList()
            })
          },

          async showEditDialog(id) {
            const { data: res } = await this.$http.get('apiTag/' + id)
            if (res.code !== 200) {
              return this.$message.error(res.msg)
            }
            this.editForm = res.data
            this.aktType = this.editForm.tagType
            this.editDialogVisible = true
          },

          editDialogClosed() {
            this.$refs.editFormRef.resetFields()
          },

          edit() {
            this.$refs.editFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.put('apiTag/' + this.editForm.id,this.editForm)
              if (res.code !== 200) {return this.$message.error(res.msg)}
              this.editDialogVisible = false
              this.getDataList()
              this.$message.success('更新数据成功！')
            })
          },

          async removById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除数据, 是否继续?','提示',
              {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
            ).catch(err => err)
            if (confirmResult !== 'confirm') {return this.$message.info('已取消删除')}
            const { data: res } = await this.$http.delete('apiTag/' + id)
            if (res.code !== 200) {
              return this.$message.error(res.msg)
            }
            this.$message.success('删除数据成功！')
            this.getDataList()
          },

      }
   }
</script>

<style lang="less" scoped>
</style>
