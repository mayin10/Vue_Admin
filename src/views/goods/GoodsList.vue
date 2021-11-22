<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
       <el-row :gutter="20">
         <el-col :span="8">
           <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getGoodsList">
             <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
           </el-input>
         </el-col>
         <el-col :span="4">
           <el-button type="primary" @click="goAddpage">添加商品</el-button>
         </el-col>
       </el-row>

      <el-table :data="goodslist"   border stripe>
            <el-table-column label="ID" prop="id" width="50px"></el-table-column>
            <el-table-column label="商品名" prop="name"></el-table-column>
            <el-table-column label="关键字" prop="keywords"></el-table-column>
            <el-table-column label="规格模型" prop="type_name"></el-table-column>
             <el-table-column label="商品品牌" prop="brand_name"></el-table-column>
            <el-table-column label="分类页显示图 ">
              <template slot-scope="scope" v-if="scope.row.wls_logo">
                <el-image style="width: 50px; height: 50px" fit="contain" :src="scope.row.wls_logo"/>
              </template>
            </el-table-column>

            <el-table-column label="主页显示图 ">
              <template slot-scope="scope"  v-if="scope.row.wls_img">
                <el-image style="width: 50px; height: 50px" fit="contain" :src="scope.row.wls_img"/>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200px">
              <template slot-scope="scope">
                <el-tooltip effect="dark" content="添加规格商品" placement="top" :enterable="false">
                  <el-button type="warning" icon="el-icon-setting" size="mini" @click="goSpecPage(scope.row.id)"></el-button>
                </el-tooltip>
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditpage(scope.row.id)"></el-button>

              </template>
            </el-table-column>
          </el-table>
          <!-- 分页区域 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
          :page-sizes="[2, 4, 6,8,10,12]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
      </el-card>

  </div>
</template>

<script>
   export default {
     data() {
       return {
          queryInfo: {keyword: '', page: 1, pagesize: 6},
          goodslist: [],
          total: 0,
          addDialogVisible: false,
       }
     },

    created() {this.getGoodsList()},

     methods: {
        async getGoodsList() {
          const { data: res } = await this.$http.get('apiGoods', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error('获取商品列表失败！')
          }
          this.goodslist = res.data.data
          this.goodslist.forEach(function (item, index) {
            // item.is_default = item.is_default==1? true: false
          });
          this.total = res.data.total
        },

        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getGoodsList()
        },

        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getGoodsList()
        },

        goAddpage() {
          this.$router.push('/goodsAdd')
        },

        goEditpage(id) {
          window.sessionStorage.setItem('goods_id', id)
          this.$router.push('/goodsEdit')
        },

        goSpecPage(id) {
          window.sessionStorage.setItem('goods_id', id)
          this.$router.push('/goodsSpec')
        },


      }
   }
</script>

<style lang="less" scoped>
</style>
