<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>平台管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>

      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
              <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>

       <el-table :data="dataList" border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="角色名称" prop="role_name"/>

         <el-table-column label="权限等级" prop="level">
           <template slot-scope="scope">
             <el-tag type="danger" v-if="scope.row.level === 0">所有权限</el-tag>
             <el-tag type="warning" v-else-if="scope.row.level === 1">一级权限</el-tag>
             <el-tag type="success" v-else-if="scope.row.level === 2">二级权限</el-tag>
             <el-tag  v-else>三级权限</el-tag>

           </template>
         </el-table-column>

         <el-table-column label="角色介绍" prop="desc"/>

         <el-table-column label="操作" width="180px">
           <template slot-scope="scope">
             <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
             <el-button type="danger" icon="el-icon-delete" size="mini" @click="removById(scope.row.id)"></el-button>
           </template>
         </el-table-column>
       </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
      :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      </el-card>

    <!-- 添加的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="addForm.role_name"></el-input>
        </el-form-item>
        <el-form-item label="角色介绍" prop="desc">
          <el-input v-model="addForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-input v-model="editForm.level"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editForm.role_name" ></el-input>
        </el-form-item>
        <el-form-item label="角色介绍" prop="email">
          <el-input v-model="editForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-input v-model="editForm.level"></el-input>
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
   export default {
     data() {
       return {
          queryInfo: {keyword: '', page: 1, pagesize: 6},
          dataList: [],
          total: 0,
          addDialogVisible: false,
          addForm: {role_name: '',desc: '',level:0},
          addFormRules: {
            role_name: [{ required: true, message: '角色名称', trigger: 'blur' },
                       {min: 3,max: 50,message: '用户名的长度在3~50个字符之间',trigger: 'blur'}],
          },
          editDialogVisible: false,
          editForm: {},
          editFormRules: {
            role_name: [{ required: true, message: '角色名称', trigger: 'blur' },
                       {min: 3,max: 50,message: '用户名的长度在3~50个字符之间',trigger: 'blur'}],
          },
       }
     },
      created() {this.getDataList()},
      methods: {
          async getDataList() {
            const { data: res } = await this.$http.get('apiRole', {params: this.queryInfo})
            if (res.code !== 200) {
              return this.$message.error('获取数据列表失败！')
            }
            this.dataList = res.data.data
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

          addDialogClosed() {
            this.$refs.addFormRef.resetFields()
          },

          add() {
            this.$refs.addFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.post('apiRole', this.addForm)
              if (res.code !== 200) {this.$message.error('添加数据失败！')}
              this.$message.success('添加数据成功！')
              this.addDialogVisible = false
              this.getDataList()
            })
          },

          async showEditDialog(id) {
            const { data: res } = await this.$http.get('apiRole/' + id)
            if (res.code !== 200) {
              return this.$message.error('查询数据失败！')
            }
            this.editForm = res.data
            this.editDialogVisible = true
          },

          editDialogClosed() {
            this.$refs.editFormRef.resetFields()
          },

          edit() {
            this.$refs.editFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.put('apiRole/' + this.editForm.id,
                { role_name: this.editForm.role_name, desc: this.editForm.desc,level:this.editForm.level}
              )
              if (res.code !== 200) {return this.$message.error('更新数据失败！')}
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
            const { data: res } = await this.$http.delete('apiRole/' + id)
            if (res.code !== 200) {
              return this.$message.error('删除数据失败！')
            }
            this.$message.success('删除数据成功！')
            this.getDataList()
          },


      }
   }
</script>

<style lang="less" scoped>
</style>
