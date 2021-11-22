<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>后台用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
       <!-- 搜索与添加区域 -->
       <el-row :gutter="20">
         <el-col :span="8">
           <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getuserList">
             <el-button slot="append" icon="el-icon-search" @click="getuserList"></el-button>
           </el-input>
         </el-col>
         <el-col :span="4">
           <el-button type="primary" @click="showAddDialog">添加用户</el-button>
         </el-col>
       </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="ID" prop="id" width="50px"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="用户头像">
          <template slot-scope="scope">
            <el-avatar :src= "scope.row.wls_img"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="用户状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" @change="userStateChanged(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeuserById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
      :page-sizes="[2, 6, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="用户头像(150*150)">
         <div>只可以上传一张图片</div>
         <imgUpload :type ="imgType" :fileList="addForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input  type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="addForm.nickname"></el-input>
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="addForm.role_id" placeholder="请选择角色">
            <el-option v-for="role_v in roleList" :key="role_v.id" :label="role_v.role_name" :value="role_v.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="用户状态" >
          <el-switch v-model="addForm.status"/>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="adduser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="150px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="用户头像(150*150)">
         <div>只可以上传一张图片</div>
          <imgUpload :type ="imgType" :fileList="editForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname"></el-input>
        </el-form-item>
        <el-form-item label="角色" >
          <el-input v-model="editForm.role_name" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="用户状态" >
          <el-switch v-model="addForm.status"/>
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
  import imgUpload from "../../components/img-upload.vue"
   export default {
     components:{imgUpload},
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
          role_id:0,
          queryInfo: {keyword: '', page: 1, pagesize: 6},
          userlist: [],
          total: 0,
          addDialogVisible: false,
          imgType:'logo',
          addForm: {},
          addFormRules: {
            username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
                       {min: 3,max: 20,message: '用户名的长度在3~10个字符之间',trigger: 'blur'}],
            password: [{ required: true, message: '请输入密码', trigger: 'blur' },
              {min: 6,max: 15,message: '用户名的长度在6~15个字符之间',trigger: 'blur'}],
            email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }]
          },

          editDialogVisible: false,
          editForm: {},
          editFormRules: {
            email: [
              { required: true, message: '请输入用户邮箱', trigger: 'blur' },
              { validator: checkEmail, trigger: 'blur' }
            ],
          },
        roleList: [],
       }
     },
     created() {
       this.getuserList()
       this.role_id = window.sessionStorage.getItem('role_id')
     },
      methods: {
        checkAuth(){
          if (this.role_id == 4){
            this.$message.error(' 三级用户只有查看数据的权限')
            return fasle
          }
          if(this.role_id == 3){
             this.$message.error('二级用户没有删除数据的权限')
              return fasle
          }
          return true
        },

        getAddForm(){
          this.addForm =  {
            username: '',
            password: '123456',
            email: '',
            nickname: '',
            status:true,
            wls_img_in:[],
            wls_img:'',
            }
        },
        async getuserList() {
          const { data: res } = await this.$http.get('admins', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error('获取用户列表失败！')
          }
          this.userlist = res.data.data
          this.userlist.forEach(function (item, index) {
             item.status = item.status==1? true: false
          });
          this.total = res.data.total
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getuserList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getuserList()
        },

        async userStateChanged(user) {
          const {data: res} = await this.$http.post('adminStatus', {id: user.id, status: user.status?1:0})
          if (res.code !== 200) {
              user.status = !user.status
             return this.$message.error(res.msg)
            }
          this.$message.success('更新用户状态成功！')
          this.getuserList()
        },

        showAddDialog() {
          if(this.checkAuth()){
            this.getRolesList()
            this.getAddForm()
            this.addDialogVisible = true
          }
        },

        async getRolesList() {
           const { data: res } = await this.$http.get('apiRoleList', {params: { type: 1 }})
           if (res.code !== 200) { return this.$message.error(res.msg)}
            this.roleList = res.data
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

        adduser() {
          this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.post('admins', this.addForm)
            if (res.code !== 200) {
              this.$message.error(res.msg)
            }
            this.$message.success('添加用户成功！')
            this.addDialogVisible = false
            this.getuserList()
          })
        },

        async showEditDialog(id) {
           if(this.checkAuth()){
             const { data: res } = await this.$http.get('admins/' + id)
             if (res.code !== 200) {
               return this.$message.error(res.msg)
             }
             this.editForm = res.data
             this.editDialogVisible = true
           }
        },

        editDialogClosed() {
          this.$refs.editFormRef.resetFields()
        },

        edituser() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('admins/' + this.editForm.id, this.editForm)
            if (res.code !== 200) {
                 return this.$message.error(res.msg)
            }
            this.editDialogVisible = false
            this.getuserList()
            this.$message.success('更新用户信息成功！')
          })
        },
        async removeuserById(id) {
          if(this.checkAuth()){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?','提示',
              {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
            ).catch(err => err)
            if (confirmResult !== 'confirm') {
              return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('admins/' + id)
            if (res.code !== 200) {
              return this.$message.error(res.msg)
            }
            this.$message.success('删除用户成功！')
            this.getuserList()
          }
        },
      }
   }
</script>

<style lang="less" scoped>
</style>
