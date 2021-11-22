<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>

     <el-alert show-icon title="注意：先选择规格模型！ 一旦规格模型使用了. 参数就不能有增删改查的操作" type="warning" :closable="false"></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择规格模型：</span>

          <el-select v-model="type_id" placeholder="请选择规格模型"  @change="handleChange">
            <el-option v-for="item in typelist" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>

        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleTabClick" >

        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" default-expand-all  border stripe >
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"/>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"/>
              <el-table-column label="参数名称" prop="name"/>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"/>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"/>
            <el-table-column label="参数名称" prop="name"/>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

      </el-tabs>

    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
   export default {
     data() {
       return {
           typelist: [],
           type_id:'',
           canEdit:true,
           activeName: 'many',
           manyTableData: [],
           onlyTableData: [],
           addDialogVisible: false,
           addForm: {name: ''},
           editDialogVisible: false,
           editForm: {},
           formRules: {name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }] },
       }
     },
      created() {this.getTypeList()},
      methods: {
        async getTypeList() {
          const { data: res } = await this.$http.get('apiTypeList', {})
          if (res.code !== 200) { return this.$message.error('获取数据失败！')}
          this.typelist = res.data
        },

        handleChange() {
          this.getParamsData()
        },
        handleTabClick() {
          this.getParamsData()
        },
        async getParamsData() {
          if (this.type_id == '') {
            this.manyTableData = []
            this.onlyTableData = []
            return
          }

          // 根据所选分类的Id，和当前所处的面板，获取对应的参数
          const { data: res } = await this.$http.get('apiAttr',{params: {type_id: this.type_id,sel: this.activeName }})
          if (res.code !== 200) {return this.$message.error('获取参数列表失败！')}
          this.canEdit =  res.data.canEdit
          res.data.arrList.forEach(item => {
            item.vals = item.vals ? item.vals.split(' ') : []
            item.inputVisible = false
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = res.data.arrList
          } else {
            this.onlyTableData = res.data.arrList
          }
        },

        showAddDialog(){
          if(!this.canEdit){
            return this.$message.error('规格模型使用中,参数就不能有增删改查的操作!')
          } else{
            this.addDialogVisible = true
          }
        },

        addDialogClosed() {
          this.$refs.addFormRef.resetFields()
        },

        addParams() {
          this.$refs.addFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.post('apiAttr',{type_id: this.type_id,name: this.addForm.name,sel: this.activeName})
            if (res.code !== 200) {return this.$message.error('添加参数失败！')}
            this.$message.success('添加参数成功！')
            this.addDialogVisible = false
            this.getParamsData()
          })
        },

        // 点击按钮，展示修改的对话框
        async showEditDialog(id) {
          if(!this.canEdit){
            return this.$message.error('规格模型使用中,参数就不能有增删改查的操作!')
          } else{
            const { data: res } = await this.$http.get('apiAttr/' + id)
            if (res.code !== 200) {return this.$message.error('查询参数信息失败！')}
            this.editForm = res.data
            this.editDialogVisible = true
          }
        },
        // 重置修改的表单
        editDialogClosed() {
          this.$refs.editFormRef.resetFields()
        },

        editParams() {
          this.$refs.editFormRef.validate(async valid => {
            if (!valid) return
            const { data: res } = await this.$http.put('apiAttr/' + this.editForm.id, {name: this.editForm.name})
            if (res.code !== 200) {return this.$message.error('修改参数失败！')}
            this.editDialogVisible = false
            this.$message.success('修改参数成功！')
            this.getParamsData()
            this.editDialogVisible = false
          })
        },

        async removeById(id) {

          if(!this.canEdit){
            return this.$message.error('规格模型使用中,参数就不能有增删改查的操作!')
          } else{
            const confirmResult = await this.$confirm('此操作将永久删除该数据, 是否继续?','提示',
              {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
            ).catch(err => err)
            if (confirmResult !== 'confirm') {
              return this.$message.info('已取消删除')
            }
            const { data: res } = await this.$http.delete('apiAttr/' + id)
            if (res.code !== 200) {
              if(res.code == 500){ return this.$message.error(res.msg)}
              return this.$message.error('删除数据失败！')
            }
            this.$message.success('删除数据成功！')
            this.getParamsData()
          }
        },

    // 文本框失去焦点，或摁下了 Enter 都会触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
        const { data: res } = await this.$http.put('apiAttr/' + row.id, {vals: row.vals.join(' ')})
        if (res.code !== 200) {return this.$message.error('修改参数失败！')}
        this.$message.success('修改参数项成功！')
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      if(!this.canEdit){
        return this.$message.error('规格模型使用中,参数就不能有增删改查的操作!')
      } else{
        row.inputVisible = true
        // 让文本框自动获得焦点
        // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
        this.$nextTick(_ => { this.$refs.saveTagInput.$refs.input.focus()})
      }           
    },
    // 删除对应的参数可选项
    handleClose(i, row) {
      if(!this.canEdit){
        return this.$message.error('规格模型使用中,参数就不能有增删改查的操作!')
      } else{
        row.vals.splice(i, 1)
        this.saveAttrVals(row)
      }

    }


   },

      computed: {
        // 动态计算标题的文本
        titleText() {
          return this.activeName === 'many'? '动态参数':'静态属性'
        },

        // 如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisabled() {
          return this.type_id.length == 0
        },
      }
   }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 120px;
  }
</style>
