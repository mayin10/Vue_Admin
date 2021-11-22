<template>
  <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>规格模型</el-breadcrumb-item>
      </el-breadcrumb>

    <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
              <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="showAddDialog">添加分组</el-button>
          </el-col>
        </el-row>
        <!-- 标签列表区域 -->
        <el-table :data="dataList" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="规格模型名" prop="name"></el-table-column>
          <el-table-column label="描述" prop="desc"></el-table-column>
          <el-table-column label="排序" prop="sort"></el-table-column>

          <el-table-column label="图片">
            <template slot-scope="scope">
              <el-image style="width: 200px; height: 100px" fit="contain" :src="scope.row.wls_img"/>
            </template>
          </el-table-column>

          <el-table-column label="是否热门">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.is_hot"  @change="hotChange(scope.row)"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120px">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
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
        <el-form-item label="分组名" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="分组简介">
            <el-input type="textarea" v-model="addForm.desc" />
        </el-form-item>

        <el-form-item label="分组图片 (530*180)">
           <div>只可以上传一张图片</div>
            <imgUpload :type ="imgType" :fileList="addForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="addForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="是否热门" >
          <el-switch v-model="addForm.is_hot"/>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改分组" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="150px">
        <el-form-item label="分组名" prop="name">
          <el-input v-model="editForm.name" ></el-input>
        </el-form-item>

        <el-form-item label="标签简介">
            <el-input type="textarea" v-model="editForm.desc" />
        </el-form-item>
        <el-form-item label="分组图片 (530*180)">
           <div>只可以上传一张图片</div>
            <imgUpload :type ="imgType" :fileList="editForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="是否热门" >
          <el-switch v-model="editForm.is_hot"/>
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
        addDialogVisible: false,
        imgType:'logo',
        addForm: {},
        formRules: {
          name: [{required: true, message: '菜单名称', trigger: 'blur' },
                 {min: 3,max: 50,message: '菜单名称的长度在3~50个字符之间',trigger: 'blur'}],
        },
        editDialogVisible: false,
        editForm: {},

     }
   },

   created() {this.getDataList()},
   methods: {
     getAddForm(){
       this.addForm =  {
         name: '',
         desc:'',
         sort:'50',
         is_hot:true,
         wls_img_in:[],
         wls_img:'',
         }
     },
       async getDataList() {
         const { data: res } = await this.$http.get('apiCategory', {params: this.queryInfo})
         if (res.code !== 200) {
           return this.$message.error(res.msg)
         }
         this.dataList = res.data.data
         this.dataList.forEach(function (item, index) {
            item.is_hot = item.is_hot==1? true: false
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

       showAddDialog(){
         this.addDialogVisible = true
         this.getAddForm()
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

        async hotChange(cate) {
          const {data: res} = await this.$http.post('apiCateHot', {id: cate.id, is_hot: cate.is_hot?1:0})
          if (res.code !== 200) {
            cate.is_hot = !cate.is_hot
              return this.$message.error(res.msg)
            }
          this.$message.success('更新数据成功!')
          this.getDataList()
        },


       add() {
          this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post('apiCategory', this.addForm)
          if (res.code !== 200) {this.$message.error(res.msg)}
          this.$message.success('添加数据成功！')
          this.addDialogVisible = false
          this.getDataList()
            })
          },

         addDialogClosed() {
          // this.$refs.addFormRef.resetFields()
           this.getAddForm()
         },

         async showEditDialog(id) {
           const { data: res } = await this.$http.get('apiCategory/' + id)
           if (res.code !== 200) { return this.$message.error(res.msg) }
           this.editForm = res.data
           this.editDialogVisible = true
         },

          editDialogClosed() {
            this.$refs.editFormRef.resetFields()
          },

          edit() {
            this.$refs.editFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.put('apiCategory/' + this.editForm.id,this.editForm)
              if (res.code !== 200) {return this.$message.error(res.msg)}
              this.editDialogVisible = false
              this.getDataList()
              this.$message.success('更新数据成功！')
            })
          },

          async removeById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除数据, 是否继续?','提示',
              {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
            ).catch(err => err)
            if (confirmResult !== 'confirm') {return this.$message.info('已取消删除')}
            const { data: res } = await this.$http.delete('apiCategory/' + id)
            if (res.code !== 200) {
              return this.$message.error(res.msg)
            }
            this.$message.success('删除数据成功！')
            this.getDataList()
          },
     }

   }



</script>

<style>
</style>
