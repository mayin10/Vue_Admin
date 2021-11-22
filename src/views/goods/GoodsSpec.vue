<template>
    <div>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加规格商品</el-breadcrumb-item>
      </el-breadcrumb>

      <el-card>
        <div slot="header" class="clearfix"><span>{{attrTabelLabel}} </span></div>

        <el-table :data="attrData.attr" border stripe size="mini">
           <el-table-column label="商品规格模型">
             <el-table-column label="规格名称" prop="name"  width="150">
               <template slot-scope="scope">
                 <el-tag type ="success"  effect="dark">{{scope.row.name}}</el-tag>
               </template>
              </el-table-column>

              <el-table-column label="规格值" prop="name">
                <template slot-scope="scope">
                  <el-radio-group v-model="scope.row.spec" @change="radioChange()">
                    <el-radio  :label="cb" v-for="(cb, i) in scope.row.vals" :key="i" border/>
                  </el-radio-group>
                </template>
               </el-table-column>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card >
        <div slot="header" class="clearfix">
          <span>根据选定的规格生成库存商品 </span>
        </div>
        <el-row>
            <el-button  v-for="spec in skuSpecs" :key="spec" type="success" plain disabled>{{spec}}</el-button>
            <el-button type="primary"  @click="showAddDialog">添加库存商品</el-button>
        </el-row>
      </el-card>


      <el-card>
      <el-table :data="skusList" border stripe>
         <el-table-column label="库存商品列表">
           <el-table-column label="ID" prop="id" width="80"/>
             <el-table-column label="是否上架">
               <template slot-scope="scope">
                 <el-switch v-model="scope.row.status"  @change="statusChange(scope.row)"/>
               </template>
             </el-table-column>

              <el-table-column label="名称" prop="name" width="80"/>
              <el-table-column label="英文名" prop="name_en" width="80"/>
              <el-table-column label="商品条码" prop="barcode"/>

              <el-table-column label="图片" width="150">
                <template slot-scope="scope">
                  <el-image style="width: 80px; height: 80px" fit="contain" :src="scope.row.wls_img"/>
                </template>
              </el-table-column>
              <el-table-column label="商品规格" prop="specs"   width="180"/>
              <el-table-column label="库存量 (德国-中国)" width="150">
                <template slot-scope="scope">
                  {{scope.row.store_de}} -  {{scope.row.store_cn}}
                </template>
              </el-table-column>

              <el-table-column label="尺寸 (L×W×H)| 重量" width="200">
                <template slot-scope="scope">
                  {{scope.row.lang}}cm * {{scope.row.lang}}cm * {{scope.row.lang}}cm | {{scope.row.weight}}kg
                </template>
              </el-table-column>

              <el-table-column label="价格(一级|二级|三级|四级)" width="250">
                <template slot-scope="scope">
                  {{scope.row.price_1 }} € | {{scope.row.price_2 }} € | {{scope.row.price_3 }} € |{{scope.row.price_4 }} €
                </template>
              </el-table-column>

              <el-table-column label="邮寄方式" width="200">
                <template slot-scope="scope">
                  <el-form label-position="left" inline>
                    <el-form-item v-for="item in scope.row.delivery" :label="item.delivery_type_text" :key = "item.id">
                      <span>{{item.preis }} € </span>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>

              <el-table-column label="排序" prop="sort"  width="80"/>
              <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
                </template>
              </el-table-column>
         </el-table-column>
      </el-table>
          <!-- 分页区域 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.page"
          :page-sizes="[6,10,20,40]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
      </el-card>


    <!-- 添加对话框 -->
    <el-dialog title="添加规格商品" :visible.sync="addDialogVisible" width="70%" @close="addDialogClosed" >
      <!-- 内容主体区域 -->
      <el-form  :model="addForm" :rules="formRules" ref="addFormRef" label-width="180px" >
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品规格" >
                <el-input v-model="addForm.specs" :disabled="true"/>
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="商品条码" prop="barcode">
              <el-input v-model="addForm.barcode" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="名称">
                <el-input v-model="addForm.name" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="英文名" >
                <el-input v-model="addForm.name_en" />
           </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存(中国)">
                <el-input v-model="addForm.store_cn" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库存(德国)" >
                <el-input v-model="addForm.store_de" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
              <el-form-item label="尺寸 (L*W*H)">
                  <el-col :span="6"><el-input v-model="addForm.lang"></el-input></el-col>
                  <el-col :span="1">*</el-col>
                  <el-col :span="6"><el-input v-model="addForm.width" /></el-col>
                  <el-col :span="1">*</el-col>
                  <el-col :span="10"><el-input v-model="addForm.height" ><template slot="append">cm</template></el-input></el-col>

             </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="重量" >
                 <el-input  v-model="addForm.weight">
                      <template slot="append">kg</template>
                 </el-input>
            </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="一级价格" prop="desc">
                 <el-input  v-model="addForm.price_1">
                      <template slot="append">€</template>
                 </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="二级价格" prop="desc">
                 <el-input  v-model="addForm.price_2">
                      <template slot="append">€</template>
                 </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="三级价格" prop="desc">
                  <el-input  v-model="addForm.price_3">
                       <template slot="append">€</template>
                  </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="四级价格" prop="desc">
                  <el-input  v-model="addForm.price_4">
                       <template slot="append">€</template>
                  </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
              <el-form-item label="是否上架" >
                  <el-switch v-model="addForm.status"/>
             </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="排序" >
                  <el-input v-model="addForm.sort" />
             </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="商品简介" prop="desc">
              <el-input type="textarea" v-model="addForm.desc"/>
            </el-form-item>
          </el-col>

            <el-col :span="24">
              <el-form-item label="图片 (300*300)">
                   <div>只可以上传一张图片</div>
                    <imgUpload :type ="imgType" :fileList="addForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
              </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="邮寄方式" v-for="(item,index) in addForm.deliveryTypes"  :key="index">
         <el-col :span="4"> <el-checkbox v-model="item.checked" :label="item.label" border></el-checkbox></el-col>

         <el-col :span="4">
              <el-input  v-model="item.preis">
                      <template slot="append">€</template>
              </el-input>
          </el-col>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>


  <!-- 修改对话框 -->
    <el-dialog title="修改标签" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="180px">

        <el-row>
          <el-col :span="12">
            <el-form-item label="商品规格" >
                <el-input v-model="editForm.specs" :disabled="true"/>
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="商品条码" prop="barcode">
              <el-input v-model="editForm.barcode" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="名称)">
                <el-input v-model="editForm.name" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="英文名" >
                <el-input v-model="editForm.name_en" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库存(中国)">
                <el-input v-model="editForm.store_cn" />
           </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库存(德国)" >
                <el-input v-model="editForm.store_de" />
           </el-form-item>
          </el-col>


          <el-col :span="12">
              <el-form-item label="尺寸 (L*W*H)">
                  <el-col :span="6"><el-input v-model="editForm.lang"></el-input></el-col>
                  <el-col :span="1">*</el-col>
                  <el-col :span="6"><el-input v-model="editForm.width" /></el-col>
                  <el-col :span="1">*</el-col>
                  <el-col :span="10"><el-input v-model="editForm.height" ><template slot="append">cm</template></el-input></el-col>

             </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="重量" >
                 <el-input  v-model="editForm.weight">
                      <template slot="append">kg</template>
                 </el-input>
            </el-form-item>
          </el-col>


          <el-col :span="12">
            <el-form-item label="一级价格" prop="desc">
                 <el-input  v-model="editForm.price_1">
                      <template slot="append">€</template>
                 </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="二级价格" prop="desc">
                 <el-input  v-model="editForm.price_2">
                      <template slot="append">€</template>
                 </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="三级价格" prop="desc">
                  <el-input  v-model="editForm.price_3">
                       <template slot="append">€</template>
                  </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="四级价格" prop="desc">
                  <el-input  v-model="editForm.price_4">
                       <template slot="append">€</template>
                  </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="12">
              <el-form-item label="是否上架" >
                  <el-switch v-model="editForm.status"/>
             </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="排序" >
                  <el-input v-model="editForm.sort" />
             </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="商品简介" prop="desc">
              <el-input type="textarea" v-model="editForm.desc"/>
            </el-form-item>
          </el-col>

            <el-col :span="24">
              <el-form-item label="图片 (300*300)">
                   <div>只可以上传一张图片</div>
                    <imgUpload :type ="imgType" :fileList="editForm.wls_img_in"  @updateImgUrl = "updateImgUrl" @imgRemove = "imgRemove"/>
              </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="邮寄方式" v-for="(item,index) in editForm.deliveryTypes"  :key="index">
         <el-col :span="4"> <el-checkbox v-model="item.checked" :label="item.label" border></el-checkbox></el-col>

         <el-col :span="4">

              <el-input  v-model="item.preis">
                      <template slot="append">€</template>
              </el-input>
          </el-col>
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
  import imgUpload from "../../components/img-upload.vue"
  export default {
     components:{imgUpload},
     data() {
       return {
          goods_id:'',
          imgType:'logo',
          spec_id:'11',

          activeName:'many',
          activeIndex: '0',
          attrData:{},
          skuSpecs: [],
          skusList: [],
          queryInfo: {goods_id:'',keyword: '', page: 1, pagesize: 6},
          goodslist: [],
          total: 0,
          addDialogVisible: false,
          addForm: {},
          formRules: {
            barcode: [{ required: true, message: '请输入商品编号', trigger: 'blur' }],
           },

        editDialogVisible: false,
        editForm: {},

       }
     },
      computed: {
        attrTabelLabel() {
          return '商品名称: '+this.attrData.goods_name+' | 规格模型: '+this.attrData.type_name
        },

        titleText() {
          return this.activeName === 'many'? '动态参数':'静态属性'
        },
        addBtnActiv(){
          return this.skusList.length > 0
        }
      },
     created() {
       this.queryInfo.goods_id = window.sessionStorage.getItem('goods_id')
       this.getParamsData()
       this.getSkusList()
       },

    methods: {
        async getParamsData() {
          // 根据所选分类的Id，和当前所处的面板，获取对应的参数
          const { data: res } = await this.$http.get('apiAttrByGoods',{params: {goods_id: this.queryInfo.goods_id,sel: this.activeName }})
          if (res.code !== 200) {return this.$message.error('获取参数列表失败！')}
          res.data.attr.forEach(item => {
            if(item.vals.length > 0){
              item.vals = item.vals ? item.vals.split(' ') : []
              item.spec=item.vals[0]
            }
          })
          this.attrData = res.data
          this. getSkuSpecs()
        },

        getSkuSpecs(){
          this.skuSpecs= []
          this.attrData.attr.forEach(item => {
            this.skuSpecs.push(item.name + ':' + item.spec )
          })
            return this.skuSpecs
         },


        radioChange(){
           this.getSkuSpecs()
        },
        async getSkusList() {
          const { data: res } = await this.$http.get('apiSkus', {params: this.queryInfo})
          if (res.code !== 200) {
            return this.$message.error(res.msg)
          }
          this.skusList = res.data.data
          this.skusList.forEach(function (item, index) {
             item.status = item.status==1? true: false
          });
          this.total = res.data.total
        },

        handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getSkusList()
        },
        handleCurrentChange(newPage) {
          this.queryInfo.page = newPage
          this.getSkusList()
        },

        async statusChange(sku) {
          const {data: res} = await this.$http.post('apiSkuStatus', {id: sku.id, status: sku.status?1:0})
          if (res.code !== 200) {
              sku.statu = !sku.statut
              return this.$message.error(res.msg)
            }
          this.$message.success('更新数据成功!')
          this.getSkusList()
        },

         getAddForm(){
           this.addForm =  {
               goods_id: this.queryInfo.goods_id,
               status:true,
               barcode:'',
               specs: this.skuSpecs.join(' '),
               name:'',
               name_en:'',
               desc:'',
               store_cn: 0,
               store_de:0,
               lang:'',
               width:'',
               height:'',
               weight:'',

               price_1:0,
               price_2:0,
               price_3:0,
               price_4:0,
               sort:'50',
               deliveryTypes:[],
               wls_img_in:[],
               wls_img:'',
             }
         },


       async showAddDialog(){
         const {data: res } =  await this.$http.get('apiCheckSpecs', {params: {goods_id: this.queryInfo.goods_id,specs: this.skuSpecs.join(' ') }})
        if (res.code !== 200) {
          this.$message.error(res.msg)
          } else{
            this.addDialogVisible = true
            this.getAddForm()
            this.addForm.deliveryTypes = res.data
          }
       },

       addDialogClosed() {
         this.getAddForm()
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

         add() {
            this.$refs.addFormRef.validate(async valid => {
              if (!valid) return
              const {data: res } = await this.$http.post('apiSkus', this.addForm)
              if (res.code !== 200) {this.$message.error(res.msg)}
              this.$message.success('添加数据成功！')
              this.getSkusList()
              this.addDialogVisible = false
              })
            },


           async showEditDialog(id) {
             const { data: res } = await this.$http.get('apiSkus/' + id)
               if (res.code !== 200) { return this.$message.error(res.msg) }
               this.editForm = res.data
               this.editDialogVisible = true
           },

          editDialogClosed() {
            this.$refs.editFormRef.resetFields()
          },

           edit() {
             this.$refs.editFormRef.validate(async valid => {
               if (!valid) return
               const { data: res } = await this.$http.put('apiSkus/' + this.editForm.id,this.editForm)
               if (res.code !== 200) {return this.$message.error(res.msg)}
               this.editDialogVisible = false
               this.getSkusList()
               this.$message.success('更新数据成功！')
             })
           },

           async removeById(id) {
             const confirmResult = await this.$confirm('此操作将永久删除数据, 是否继续?','提示',
               {confirmButtonText: '确定',cancelButtonText: '取消', type: 'warning'}
             ).catch(err => err)
             if (confirmResult !== 'confirm') {return this.$message.info('已取消删除')}
             const { data: res } = await this.$http.delete('apiSkus/' + id)
             if (res.code !== 200) {
               return this.$message.error(res.msg)
             }
             this.$message.success('删除数据成功！')
             this.getSkusList()
           },

    },
}

</script>

<style lang="less" scoped>
  .euro{
    padding: 200px;
    color: brown;

  }
</style>
