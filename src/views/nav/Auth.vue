<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>平台管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    </el-breadcrumb>

      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
              <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加权限</el-button>
          </el-col>
        </el-row>


       <el-table :data="dataList" row-key="id" :tree-props="{children: 'children'}"  border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="权限名称" prop="auth_name">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === 0">{{scope.row.auth_name}}</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === 1">{{scope.row.auth_name}}</el-tag>
            <el-tag type="warning" v-else>{{scope.row.auth_name}}</el-tag>
          </template>
         </el-table-column>
         <el-table-column label="控制器" prop="auth_c"/>
         <el-table-column label="操作方法" prop="auth_a"/>
         <el-table-column label="是否菜单">
           <template slot-scope="scope">
             <el-switch v-model="scope.row.is_nav" @change="userStateChanged(scope.row)"/>
           </template>
         </el-table-column>
         <el-table-column label="权限排序" prop="sort"></el-table-column>
          <el-table-column label="权限等级" prop="level">
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
       }
     },
      created() {this.getDataList()},
      methods: {
          async getDataList() {
            const { data: res } = await this.$http.get('apiAuth', {params: this.queryInfo})
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
      }
   }
</script>

<style lang="less" scoped>
</style>
