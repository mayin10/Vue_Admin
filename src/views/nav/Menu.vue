<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>平台管理</el-breadcrumb-item>
      <el-breadcrumb-item>菜单管理</el-breadcrumb-item>
    </el-breadcrumb>

      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
              <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="showAddDialog">添加菜单</el-button>
          </el-col>
        </el-row>

       <el-table :data="dataList" row-key="id" :tree-props="{children: 'children'}"  border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="菜单名称" prop="menu_name">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === 0">{{scope.row.menu_name}}</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === 1">{{scope.row.menu_name}}</el-tag>
            <el-tag type="warning" v-else>{{scope.row.menu_name}}</el-tag>
          </template>

         </el-table-column>
         <el-table-column label="菜单路径" prop="menu_path"></el-table-column>
         <el-table-column label="客户页面显示">
           <template slot-scope="scope">
             <el-switch v-model="scope.row.is_show" @change="menuShowChanged(scope.row)"/>
           </template>
         </el-table-column>
         <el-table-column label="有效">
           <template slot-scope="scope">
             <el-switch v-model="scope.row.status" @change="menuStatusChanged(scope.row)"/>
           </template>
         </el-table-column>
         <el-table-column label="菜单排序" prop="sort"></el-table-column>
          <el-table-column label="菜单等级" prop="level">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level === 0">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.level === 1">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>

          </el-table-column>
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
      <el-dialog title="添加菜单" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="100px">
          <el-form-item label="菜单名称" prop="menu_name">
            <el-input v-model="addForm.menu_name"></el-input>
          </el-form-item>
          <el-form-item label="菜单路径" prop="menu_path">
            <el-input v-model="addForm.menu_path"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input v-model="addForm.sort"></el-input>
          </el-form-item>

          <el-form-item label="是否显示" >
            <el-switch v-model="addForm.is_show"/>
          </el-form-item>
          <el-form-item label="是否有效" >
            <el-switch v-model="addForm.status"/>
          </el-form-item>
         <el-form-item label="菜单分类：">
           <!-- options 用来指定数据源 --><!-- props 用来指定配置对象 -->
           <el-cascader expand-trigger="hover" :options="parentList" :props="cascaderProps"
              v-model="selectedKeys" @change="parentChanged" clearable change-on-select/>

         </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="add">确 定</el-button>
        </span>
      </el-dialog>

    <el-dialog title="修改菜单" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
        <el-form-item label="菜单名称" prop="menu_name">
          <el-input v-model="editForm.menu_name" ></el-input>
        </el-form-item>
        <el-form-item label="菜单路径" prop="menu_path">
          <el-input v-model="editForm.menu_path"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="是否显示" >
          <el-switch v-model="editForm.is_show"/>
        </el-form-item>
        <el-form-item label="是否有效" >
          <el-switch v-model="editForm.status"/>
        </el-form-item>
        <el-form-item label="父级分类：">
              <el-input v-model="editForm.parents" :disabled="true"></el-input>
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

          parentList: [],
          cascaderProps: {value: 'id', label: 'menu_name',children: 'children'},
          selectedKeys: [],

         addDialogVisible: false,
         addForm: {menu_name: '',menu_path: '',pid: 0, level:0, sort:'50',is_show:true,status:true},
         formRules: {
           menu_name: [{ required: true, message: '菜单名称', trigger: 'blur' },
                      {min: 3,max: 50,message: '菜单名称的长度在3~50个字符之间',trigger: 'blur'}],
           menu_path: [{ required: true, message: '菜单名称', trigger: 'blur' },
                      {min: 3,max: 50,message: '菜单名称的长度在3~50个字符之间',trigger: 'blur'}],
         },
         editDialogVisible: false,
         editForm: {},

       }
     },

      created() {this.getDataList()},
      methods: {
          async getDataList() {
            const { data: res } = await this.$http.get('apiMenu', {params: this.queryInfo})
            if (res.code !== 200) {
                if(res.code == 500){
                   return this.$message.error(res.msg)
                }
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

        async menuStatusChanged(row) {
          const {data: res} = await this.$http.post('apiMenuStatus', {id: row.id, status: row.status})
            if (res.code !== 200) {
                row.status = !row.status
                return this.$message.error(res.msg)
              }
            this.$message.success('更新数据状态成功！')
            this.getDataList()
        },

        async menuShowChanged(row) {
          const {data: res} = await this.$http.post('apiMenuShow', {id: row.id, is_show: row.is_show})
            if (res.code !== 200) {
                row.is_show = !row.is_show
                return this.$message.error(res.msg)
              }
            this.$message.success('更新数据状态成功！')
            this.getDataList()
        },
        showAddDialog() {
          this.getParenList()
          this.addDialogVisible = true
        },

         async getParenList() {
           const { data: res } = await this.$http.get('apiParentMenu', {params: { type: 1 }})
           if (res.code !== 200) { return this.$message.error('获取父级数据失败！')}
           this.parentList = res.data
          },


        parentChanged() {
          if (this.selectedKeys.length > 0) {
            this.addForm.pid = this.selectedKeys[this.selectedKeys.length - 1]
          } else {
            this.addForm.pid = 0
          }
        },

         addDialogClosed() {
           this.$refs.addFormRef.resetFields()
           this.selectedKeys = []
           this.addForm.level = 0
           this.addForm.pid = 0
         },

          add() {
            this.$refs.addFormRef.validate(async valid => {
              if (!valid) return
              const { data: res } = await this.$http.post('apiMenu', this.addForm)
              if (res.code !== 200) {this.$message.error('添加数据失败！')}
              this.$message.success('添加数据成功！')
              this.addDialogVisible = false
              this.getDataList()
            })
          },

          async showEditDialog(id) {
            const { data: res } = await this.$http.get('apiMenu/' + id)
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
              const { data: res } = await this.$http.put('apiMenu/' + this.editForm.id,this.editForm)
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
            const { data: res } = await this.$http.delete('apiMenu/' + id)
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
