<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>店铺列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
       <el-row :gutter="20">
         <el-col :span="8">
           <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getShopList">
             <el-button slot="append" icon="el-icon-search" @click="getShopList"></el-button>
           </el-input>
         </el-col>
         <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible = true">添加店铺</el-button>
         </el-col>
       </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="shopList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="店铺名称" prop="name_cn"></el-table-column>
        <el-table-column label="店铺Logo" >
          <template slot-scope="scope">
            <el-avatar :src= "scope.row.wls_img"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="店铺负责人" prop="principal"></el-table-column>
        <el-table-column label="联系电话" prop="tel"></el-table-column>
        <el-table-column label="客服微信" prop="weixin"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.shop_status" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
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
            shopList: [],
            total: 0,
          }
     },
     created() {this.getShopList()},
      methods: {
        async getShopList() {
          const { data: res } = await this.$http.get('apiShops', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error('获取数据列表失败！')
          }
          this.shopList = res.data.data
          this.shopList.forEach(function (item, index) {
             item.shop_status = item.shop_status==1? true: false
          });
          this.total = res.data.total
        },
        // 监听 pagesize 改变的事件
        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getShopList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getShopList()
        },


      }
   }
</script>

<style lang="less" scoped>
</style>
