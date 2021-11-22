<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>前段用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
       <!-- 搜索与添加区域 -->
       <el-row :gutter="20">
         <el-col :span="8">
           <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
             <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
           </el-input>
         </el-col>
         <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
         </el-col>
       </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
         <el-table-column label="ID" prop="id"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
         <el-table-column label="后台用户" >
          <template slot-scope="scope">
            <el-tag type="info" v-if="scope.row.is_admin === 0" >否</el-tag>
            <el-tag type="warning" v-if="scope.row.is_admin === 1">是</el-tag>
          </template>

         </el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="tel"></el-table-column>
        <el-table-column label="用户头像" >
          <template slot-scope="scope">
            <el-avatar :src= "scope.row.wls_img"></el-avatar>
          </template>
        </el-table-column>
         <el-table-column label="微信ID" prop=""/>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.status === 0"  @click="userActive(scope.row.id)">点击激活</el-tag>
            <el-tag type="success" v-if="scope.row.status === 1">已激活</el-tag>
          </template>
        </el-table-column>、
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="用户地址管理" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-s-data" size="mini" @click="goAddressPage(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeuserById(scope.row.id)"></el-button>

          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
      :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="mobile">
          <el-input v-model="addForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="addForm.tel"></el-input>
        </el-form-item>
       <el-form-item label="性别" >
         <el-input v-model="addForm.gender"></el-input>
       </el-form-item>
      <el-form-item label="生日" >
        <el-input v-model="addForm.birthday"></el-input>
      </el-form-item>


      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="mobile">
          <el-input v-model="editForm.nickname"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
   export default {
     data() {
       // 验证邮箱的规则
       var checkEmail = (rule, value, cb) => {
         // 验证邮箱的正则表达式
         const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
         if (regEmail.test(value)) {return cb()}
         cb(new Error('请输入合法的邮箱'))
       }
       // 验证手机号的规则
       var checkMobile = (rule, value, cb) => {
         // 验证手机号的正则表达式
         const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
         if (regMobile.test(value)) {return cb()}
         cb(new Error('请输入合法的手机号'))
       }
       return {
          queryInfo: {keyword: '', page: 1, pagesize: 6},
          userlist: [],
          total: 0,
          addDialogVisible: false,
          addForm: {username: '',password: '',email: '',nickname: ''},
          addFormRules: {
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
                       {min: 3,max: 10,message: '用户名的长度在3~10个字符之间',trigger: 'blur'}],
            password: [{ required: true, message: '请输入密码', trigger: 'blur' },
              {min: 6,max: 15,message: '用户名的长度在6~15个字符之间',trigger: 'blur'}],
            email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }],
          },

          editDialogVisible: false,
          // 查询到的用户信息对象
          editForm: {},
          // 修改表单的验证规则对象
          editFormRules: {
            email: [
              { required: true, message: '请输入用户邮箱', trigger: 'blur' },
              { validator: checkEmail, trigger: 'blur' }
            ],

          },

       }
     },
     created() {this.getDataList()},
      methods: {
        async getDataList() {
          const { data: res } = await this.$http.get('apiusers', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error('获取用户列表失败！')
          }
          this.userlist = res.data.data
          this.userlist.forEach(function (item, index) {
           //  item.status = item.status==1? true: false
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
        async userActive(id) {
          const {data: res} = await this.$http.post('apiToActive', {activ_id: id})
            if (res.code !== 200) {return this.$message.error('更新失败！')}
            this.$message.success('请查看邮箱， 点击激活链接， 并重新登录！')
        },

        goAddressPage(id) {
          window.sessionStorage.setItem('cur_user_id', id)
          this.$router.push('/address')
        },

        addDialogClosed() {
          this.$refs.addFormRef.resetFields()
        },

        add() {
          this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.post('apiusers', this.addForm)
            if (res.code !== 200) {
              this.$message.error('添加用户失败！')
            }
            this.$message.success('添加用户成功！')
            this.addDialogVisible = false
            this.getDataList()
          })
        },

        async showEditDialog(id) {
          const { data: res } = await this.$http.get('apiusers/' + id)
          if (res.code !== 200) {
            return this.$message.error('查询用户信息失败！')
          }
          this.editForm = res.data
          this.editDialogVisible = true
        },

        editDialogClosed() {
          this.$refs.editFormRef.resetFields()
        },

        edituser() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('apiusers/' + this.editForm.id,
              { email: this.editForm.email, nickname: this.editForm.nickname}
            )
            if (res.code !== 200) {
              return this.$message.error('更新用户信息失败！')
            }
            this.editDialogVisible = false
            this.getDataList()
            this.$message.success('更新用户信息成功！')
          })
        },
        async removeuserById(id) {
          const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?','提示',
            {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
          ).catch(err => err)
          if (confirmResult !== 'confirm') {
            return this.$message.info('已取消删除')
          }
          const { data: res } = await this.$http.delete('apiusers/' + id)
          if (res.code !== 200) {
            return this.$message.error('删除用户失败！')
          }
          this.$message.success('删除用户成功！')
          this.getDataList()
        },

      }
   }
</script>

<style lang="less" scoped>
</style>
