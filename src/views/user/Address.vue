<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>前段用户列表</el-breadcrumb-item>
      <el-breadcrumb-item>用户地址管理</el-breadcrumb-item>
    </el-breadcrumb>

      <el-descriptions :title="title">

      </el-descriptions>

      <el-card>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
                <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="showAddDialog">添加新地址</el-button>
            </el-col>
          </el-row>
          <!-- 用户列表区域 -->
          <el-table :data="dataList" border stripe>
            <el-table-column label="ID"  prop="id" width="50px"></el-table-column>
            <el-table-column label="收件人" prop="consignee"></el-table-column>
            <el-table-column label="默认收货地址" width="100px">
              <template slot-scope="scope">
                <el-button v-if="scope.row.is_default_delivery ==1" type="success"  :disabled="true" icon="el-icon-circle-check" size="mini"></el-button>
                <el-tooltip effect="dark" content="设为默认" placement="top" >
                  <el-button v-if="scope.row.is_default_delivery == 0" type="info"  icon="el-icon-circle-close" size="mini" @click="defaultChanged(scope.row,'t')"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="默认账单地址" width="100px">
              <template slot-scope="scope">
                <el-button v-if="scope.row.is_default_bill==1" type="success"  :disabled="true" icon="el-icon-circle-check" size="mini"></el-button>

                <el-tooltip effect="dark" content="设为默认" placement="top" >
                  <el-button v-if="scope.row.is_default_bill==0" type="info"  icon="el-icon-circle-close" size="mini" @click="defaultChanged(scope.row,'b')"></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="手机号" prop="tel"></el-table-column>
            <el-table-column label="Email" prop="email"></el-table-column>
            <el-table-column label="国家" prop="country"></el-table-column>
            <el-table-column label="邮编"  prop="postcode"/>
            <el-table-column label="城市" prop="city"></el-table-column>
            <el-table-column label="街道"  prop="street"/>
            <el-table-column label="房屋号"  prop="house_number"/>

            <el-table-column label="操作" width="200px">
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

      <!-- 添加新地址 -->
      <el-dialog title="添加新地址" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="100px">
          <el-form-item label="收货人姓名" prop="consignee">
            <el-input v-model="addForm.consignee"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="tel">
            <el-input v-model="addForm.tel"></el-input>
          </el-form-item>
          <el-form-item label="国家" prop="country">
            <el-select v-model="addForm.country" placeholder="请选国家">
              <el-option v-for="item in countryList" :key="item.id" :label="item.name_cn" :value="item.code"/>
            </el-select>
          </el-form-item>
          <el-form-item label="邮编" prop="postcode">
            <el-input v-model="addForm.postcode"></el-input>
          </el-form-item>
          <el-form-item label="城市" prop="city">
            <el-input v-model="addForm.city"></el-input>
          </el-form-item>
          <el-form-item label="街道" prop="street">
            <el-input v-model="addForm.street"></el-input>
          </el-form-item>
         <el-form-item label="房屋号" prop="house_number">
           <el-input v-model="addForm.house_number"></el-input>
         </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="add">确 定</el-button>
        </span>
      </el-dialog>


      <!-- 修改地址 -->
      <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%">
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
          <el-form-item label="收货人姓名" prop="consignee">
            <el-input v-model="editForm.consignee"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="tel">
            <el-input v-model="editForm.tel"></el-input>
          </el-form-item>
          <el-form-item label="国家" prop="country">
            <el-select v-model="editForm.country">
              <el-option v-for="item in countryList" :key="item.code" :label="item.name_cn" :value="item.code"/>
            </el-select>
           </el-form-item>
          <el-form-item label="邮编" prop="postcode">
            <el-input v-model="editForm.postcode"></el-input>
          </el-form-item>
          <el-form-item label="城市" prop="city">
            <el-input v-model="editForm.city"></el-input>
          </el-form-item>
          <el-form-item label="街道" prop="street">
            <el-input v-model="editForm.street"></el-input>
          </el-form-item>
         <el-form-item label="房屋号" prop="house_number">
           <el-input v-model="editForm.house_number"></el-input>
         </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="edit">确 定</el-button>
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
          userInfo: {},
          queryInfo: {cur_user_id:'', keyword: '', page: 1, pagesize: 6},
          dataList: [],
          countryList:[],
          total: 0,
          addDialogVisible: false,
          addForm: {},
          formRules: {
            consignee: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' },
                       {min: 3,max: 10,message: '用户名的长度在3~10个字符之间',trigger: 'blur'}],
            tel: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
            email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }],
            country: [{ required: true, message: '请输入国家', trigger: 'blur' }],
            postcode: [{ required: true, message: '请输入城市', trigger: 'blur' }],
            city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
            street: [{ required: true, message: '请输入街道', trigger: 'blur' }],
            house_number: [{ required: true, message: '请输入房屋号', trigger: 'blur' }],
          },

          editDialogVisible: false,
          editForm: {},

        }


     },
    created() {
        this.queryInfo.cur_user_id = window.sessionStorage.getItem('cur_user_id')
        this.getUserInfo()
        this.getDataList()

      },
      computed: {
        title(){
          return "用户信息 (ID: "+this.userInfo.id + ", 用户名: " +this.userInfo.username + ")"
        }
      },
     methods: {
         async getUserInfo() {
           const { data: res } = await this.$http.get('apiusers/' + this.queryInfo.cur_user_id)
           if (res.code !== 200) {
             return this.$message.error('查询用户信息失败！')
           }
           this.userInfo = res.data
         },
         async getCountryList() {
           if(this.countryList.length == 0){
             const { data: res } = await this.$http.get('apiCountryList',{})
             if (res.code !== 200) { return this.$message.error('查询信息失败！')}
             this.countryList = res.data
           }
         },

         async getDataList() {
           const { data: res } = await this.$http.get('apiAddress', {params: this.queryInfo})
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

        getAddForm(){
           this.addForm = {
                  cur_user_id:this.userInfo.id,
                  consignee: this.userInfo.username,
                  tel:this.userInfo.tel,
                  email:this.userInfo.email,
                  country:this.userInfo.country,
                  city:this.userInfo.city,
                  street:'',
                  house_number:'',
             }
         },

        showAddDialog(){
          this.getCountryList()
          this.getAddForm()
          this.addDialogVisible = true
        },

        addDialogClosed() {
            this.getAddForm()
        },

        async defaultChanged(address, type){
          const confirmResult = await this.$confirm('此操作将更新地址状态, 是否继续?','提示',
            {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
          ).catch(err => err)
          if (confirmResult !== 'confirm') {
              return this.$message.info('已取消操作')
          }
          const {data: res } = await this.$http.post('apiChangeDefault',{id:address.id, cur_user_id: this.userInfo.id,type:type})
          if (res.code !== 200) {
              return this.$message.error('更新地址状态失败！')
          }
          this.$message.success('更新地址状态成功！')
          this.getDataList()
        },

        add() {
            this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
          //  const { data: res } = await this.$http.post('apiAddAddress', this.addForm)
          const { data: res } = await this.$http.post('apiAddress', this.addForm)
            if (res.code !== 200) {this.$message.error('添加地址失败！')}
             this.$message.success('添加地址成功！')
             this.addDialogVisible = false
             this.getDataList()
            })
          },


        async showEditDialog(id) {
          const { data: res } = await this.$http.get('apiAddress/' + id)
          if (res.code !== 200) {
            return this.$message.error(res.msg)
          }
          this.editForm = res.data
          this.editDialogVisible = true
        },

        edit() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('apiAddress/' + this.editForm.id, this.editForm)
            if (res.code !== 200) {
                 return this.$message.error(res.msg)
            }
            this.editDialogVisible = false
            this.getDataList()
            this.$message.success('更新数据成功！')
          })
        },

        async removeById(id) {
           const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?','提示',
              {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
           ).catch(err => err)
           if (confirmResult !== 'confirm') {
              return this.$message.info('已取消删除')
           }
           const { data: res } = await this.$http.delete('apiAddress/' + id)
           if (res.code !== 200) {
             return this.$message.error(res.msg)
           }
          this.$message.success('删除数据成功！')
          this.getDataList()
        }
       },
  }
</script>

<style>
</style>
