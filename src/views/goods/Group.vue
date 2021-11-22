<template>
  <div>
   <el-breadcrumb separator-class="el-icon-arrow-right">
     <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
     <el-breadcrumb-item>商品管理</el-breadcrumb-item>
     <el-breadcrumb-item>商品分类</el-breadcrumb-item>
   </el-breadcrumb>

   <el-card>
     <el-row>
       <el-col>
         <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
       </el-col>
     </el-row>
     <!-- 表格 -->
     <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
       <!-- 是否有效 -->
       <template slot="isok" slot-scope="scope">
         <i class="el-icon-success" v-if="scope.row.is_show === 1" style="color: lightgreen;"></i>
         <i class="el-icon-error" v-else style="color: red;"></i>
       </template>
       <!-- 排序 -->
       <template slot="order" slot-scope="scope">
         <el-tag size="mini" v-if="scope.row.level===0">一级</el-tag>
         <el-tag type="success" size="mini" v-else-if="scope.row.level===1">二级</el-tag>
         <el-tag type="warning" size="mini" v-else>三级</el-tag>
       </template>
       <!-- 操作 -->
       <template slot="opt" slot-scope="scope">
         <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.id)">编辑</el-button>
         <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)">删除</el-button>
       </template>
     </tree-table>
     <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
      :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
   </el-card>

   <!-- 添加分类的对话框 -->
     <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
       <!-- 添加分类的表单 -->
       <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
         <el-form-item label="分类名称：" prop="cate_name">
           <el-input v-model="addCateForm.cate_name"></el-input>
         </el-form-item>
         <el-form-item label="父级分类：">
           <!-- options 用来指定数据源 --><!-- props 用来指定配置对象 -->
           <el-cascader expand-trigger="hover" :options="parentCateList" :props="cascaderProps"
              v-model="selectedKeys" @change="parentCateChanged" clearable change-on-select/>

         </el-form-item>
       </el-form>
       <span slot="footer" class="dialog-footer">
         <el-button @click="addCateDialogVisible = false">取 消</el-button>
         <el-button type="primary" @click="addCate">确 定</el-button>
       </span>
     </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="addCateFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="分类名称"  prop="cate_name">
          <el-input v-model="editForm.cate_name" ></el-input>
        </el-form-item>
        <el-form-item label="分类路径">
          <el-input v-model="editForm.pid_path_name"  disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
   export default {
     data() {
       return {
          queryInfo: {keyword: '', page: 1, pagesize: 6},
          catelist: [],
          total: 0,
          columns: [
              {label: '分类名称',prop: 'cate_name'},
              {label: '是否有效', type: 'template',template: 'isok'},
              {label: '排序', type: 'template',template: 'order'},
              {label: '操作', type: 'template',template: 'opt'}
            ],
           addCateDialogVisible: false,
           addCateForm: {cate_name: '', pid: 0,  level: 0},
           addCateFormRules: { cate_name:[{ required: true, message: '请输入分类名', trigger: 'blur' },
                                         {min: 1,max: 10,message: '分类名的长度在3~10个字符之间',trigger: 'blur'}]},
           parentCateList: [],
           cascaderProps: {value: 'id', label: 'cate_name',children: 'children'},
           selectedKeys: [],

           editDialogVisible: false,
           editForm: {},
       }
     },
     created() {this.getCateList()},
     methods: {
        async getCateList() {
          const { data: res } = await this.$http.get('apiGroups', {params: this.queryInfo})
          if (res.code !== 200) {return this.$message.error('获商品分类失败！')}
          this.catelist = res.data.data
          this.total = res.data.total
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getCateList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getCateList()
        },

        showAddCateDialog() {
          this.getParentCateList()
          this.addCateDialogVisible = true
        },

        async getParentCateList() {
          const { data: res } = await this.$http.get('parentList', {params: { type: 2 }})
          if (res.code !== 200) { return this.$message.error('获取父级分类数据失败！')}
          this.parentCateList = res.data
        },

        parentCateChanged() {
          console.log(this.selectedKeys)
          // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
          // 反之，就说明没有选中任何父级分类
          if (this.selectedKeys.length > 0) {
            // 父级分类的Id
            this.addCateForm.pid = this.selectedKeys[this.selectedKeys.length - 1]
            // 为当前分类的等级赋值
            this.addCateFormlevel = this.selectedKeys.length
          } else {
            // 父级分类的Id
            this.addCateForm.pid = 0
            // 为当前分类的等级赋值
            this.addCateForm.level = 0
          }
        },

        addCate() {
          this.$refs.addCateFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.post('apiGroups', this.addCateForm)
            if (res.code !== 200) {return this.$message.error('添加分类失败！')}
            this.$message.success('添加分类成功！')
            this.getCateList()
            this.addCateDialogVisible = false
          })
        },

        addCateDialogClosed() {
          this.$refs.addCateFormRef.resetFields()
          this.selectedKeys = []
          this.addCateForm.level = 0
          this.addCateForm.pid = 0
        },


        async showEditDialog(id) {
          const { data: res } = await this.$http.get('apiGroups/' + id)
          if (res.code !== 200) {return this.$message.error('查询分类信息失败！')}
          this.editForm = res.data
          this.editDialogVisible = true
        },

        editDialogClosed() {
          this.$refs.editFormRef.resetFields()
        },

        editCate() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('apiGroups/' + this.editForm.id,
              {cate_name: this.editForm.cate_name}
            )
            if (res.code !== 200) {return this.$message.error('更新分类信息失败！')}
            this.editDialogVisible = false
            this.getCateList()
            this.$message.success('更新分类信息成功！')
          })
        },

        async removeById(id) {
          const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?','提示',
            {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
          ).catch(err => err)
          if (confirmResult !== 'confirm') {
            return this.$message.info('已取消删除')
          }
          const { data: res } = await this.$http.delete('apiGroups/' + id)
          if (res.code !== 200) {
            if(res.code == 500){ return this.$message.error(res.msg)}
            return this.$message.error('删除数据失败！')
          }
          this.$message.success('删除数据成功！')
          this.getCateList()
        },
      }
   }
</script>

<style lang="less" scoped>
</style>
