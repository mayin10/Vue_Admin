<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.keyword" clearable @clear="getDataList">
            <el-button slot="append" icon="el-icon-search" @click="getDataList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="dataList" border stripe>
        <el-table-column label="ID" prop="id"></el-table-column>
        <el-table-column label="订单号" prop="order_sn"></el-table-column>
        <el-table-column label="生成日期" prop="create_time"></el-table-column>
        <el-table-column label="发货日期" prop="shipping_time"></el-table-column>
        <el-table-column label="收件人" prop="daddress.consignee"></el-table-column>
        <el-table-column label="发货方式" prop="delivery_text"></el-table-column>
        <el-table-column label="商品总价" prop="total_price"></el-table-column>
        <el-table-column label="应付金额" prop="total_price"></el-table-column>
        <el-table-column label="商品总数" prop="total_amount"></el-table-column>
        <el-table-column label="订单状态" prop="status_text">
         <template slot-scope="scope">
           <el-tag type="danger" v-if="scope.row.status === 10">{{scope.row.status_text}}</el-tag>
           <el-tag type="info" v-else-if="scope.row.status === 60">{{scope.row.status_text}}</el-tag>
           <el-tag type="warning" v-else>{{scope.row.status_text}}</el-tag>
         </template>


        </el-table-column>

        <el-table-column label="操作" width="300px">

          <template slot-scope="scope">
            <el-tooltip  effect="dark" content="查看物流" placement="top" :enterable="false">
               <el-button type="success" icon="el-icon-receiving" size="mini" @click="shipDialogVisible=true">
               </el-button>
            </el-tooltip>

            <el-tooltip v-if="scope.row.invoice_link!=null && scope.row.invoice_link.length > 0" effect="dark"
              content="查看账单" placement="top" :enterable="false">
              <el-button type="success" icon="el-icon-tickets" size="mini" @click="showInvoice(scope.row.invoice_link)">
              </el-button>
            </el-tooltip>

            <el-tooltip v-if="scope.row.invoice_link==null || scope.row.invoice_link.length == 0" effect="dark"
              content="账单还没生成" placement="top" :enterable="false">
              <el-button type="info" icon="el-icon-tickets" size="mini"></el-button>
            </el-tooltip>

            <el-tooltip effect="dark" content="查看订单详情" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-s-data" size="mini" @click="showDetailDialog(scope.row.id)">
              </el-button>
            </el-tooltip>

            <el-tooltip effect="dark" content="修改订单" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="取消订单" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-close" size="mini" @click="cancelOrder(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.page" :page-sizes="[6, 10, 20,50]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <el-dialog title="订单详情" :visible.sync="detailDialogVisible" width="75%">
      <el-descriptions title="订单状态">
        <el-descriptions-item label="订单号">{{detail. order_sn}}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{detail. order_status}}</el-descriptions-item>
        <el-descriptions-item label="支付方式">{{detail.pay_name}}</el-descriptions-item>
        <el-descriptions-item label="支付code">{{detail.pay_code}}</el-descriptions-item>
        <el-descriptions-item label="发票抬头">{{detail.invoice_title}}</el-descriptions-item>

        <el-descriptions-item label="商品总价">{{detail.goods_price}}</el-descriptions-item>
        <el-descriptions-item label="邮费">{{detail.shipping_price}}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">{{detail.coupon_price}}</el-descriptions-item>
        <el-descriptions-item label="应付金额">{{detail.order_amount}}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="物流状态">
        <el-descriptions-item label="物流名称">{{detail. shipping_name}}</el-descriptions-item>
        <el-descriptions-item label="物流单号">{{detail. shipping_sn}}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="收货地址">
        <el-descriptions-item label="收件人姓名">{{delivery_address.consignee}}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{delivery_address.tel}}</el-descriptions-item>
        <el-descriptions-item label="Email">{{delivery_address.email}}</el-descriptions-item>
        <el-descriptions-item label="收件人地址">{{delivery_detail_address}}</el-descriptions-item>
        <el-descriptions-item label="用户备注">{{detail.user_note}}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="账单地址">
        <el-descriptions-item label="收件人姓名">{{bill_address.consignee}}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{bill_address.tel}}</el-descriptions-item>
        <el-descriptions-item label="Email">{{bill_address.email}}</el-descriptions-item>
        <el-descriptions-item label="收件人地址">{{bill_detail_address}}</el-descriptions-item>
      </el-descriptions>


      <el-table :data="detail.orderGoods" border stripe>
        <el-table-column label="购买商品列表">
          <el-table-column type="index" />
          <el-table-column label="商品名称" prop="goods_name" />

          <el-table-column label="显示图片">
            <template slot-scope="scope">
              <el-image style="width: 80px; height: 80px" fit="contain" :src="scope.row.img" />
            </template>
          </el-table-column>
          <el-table-column label="商品规格" prop="goods_name" />
          <el-table-column label="商品税率" prop="vat" />
          <el-table-column label="商品价格" prop="goods_price" />
          <el-table-column label="购买数量" prop="amount" />

        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改订单状态和地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="150px">
        <el-form-item label="订单号" prop="order_sn">
          <el-input v-model="editForm.order_sn" :disabled="true"></el-input>
        </el-form-item>

        <el-form-item label="订单状态">
          <el-input type="text" v-model="editForm.status_text" :disabled="true" />
          <el-button type="primary" size="mini" v-if="editForm.status == 10" @click="toPay()">已付款</el-button>
        </el-form-item>

        <el-form-item label="当前收货地址">
          <el-input type="textarea" v-model="delivery_detail_address" :disabled="true" />
          <el-button type="primary" size="mini" @click="selectDelivery">选择收货地址</el-button>
        </el-form-item>
        <el-form-item label="当前账单地址">
          <el-input type="textarea" v-model="bill_detail_address" :disabled="true" />
          <el-button type="primary" size="mini" @click="selectBill">选择账单地址</el-button>
        </el-form-item>


      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="address_title" :visible.sync="addressDialogVisible" width="50%">
      <el-table ref="multipleTable" :data="addressList" border stripe>
        <el-table-column label="选择" width="50px">
          <template slot-scope="scope">
            <el-button type="warning" icon="el-icon-check" circle size="mini" @click="selectAddress(scope.row)">
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="收件人" prop="consignee" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="电话" prop="tel" />

        <el-table-column label="地址" width="300px">
          <template slot-scope="scope">
            <el-tag type="warning">
              {{scope.row.consignee+' ' + scope.row.street+' ' + scope.row.house_number+' ' + scope.row.postcode+' ' + scope.row.city+' ' + scope.row.country}}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog title="物流信息" :visible.sync="shipDialogVisible" width="50%">
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :icon="activity.icon"
            :type="activity.type"
            :color="activity.color"
            :size="activity.size"
            :timestamp="activity.timestamp">
            {{activity.content}}
          </el-timeline-item>
        </el-timeline>

    </el-dialog>



  </div>
</template>

<script>
  export default {

    props: {
      status: Number,
    },

    data() {
      return {
        queryInfo: {
          keyword: '',
          page: 1,
          pagesize: 6,
          status: this.status
        },
        dataList: [],
        total: 0,
        formRules: {
          consignee: [{
              required: true,
              message: '标签名称',
              trigger: 'blur'
            },
            {
              min: 1,
              max: 50,
              message: '标签名称的长度在3~50个字符之间',
              trigger: 'blur'
            }
          ],
        },
        detail: {},
        detailDialogVisible: false,
        editDialogVisible: false,
        editForm: {},
        addressList: [],
        bill_address: {
          consignee: '',
          street: '',
          house_number: '',
          postcode: '',
          city: '',
          country: ''
        },
        delivery_address: {
          consignee: '',
          street: '',
          house_number: '',
          postcode: '',
          city: '',
          country: ''
        },
        addressDialogVisible: false,
        addressType: '',

        shipDialogVisible:false,
        shippingdata: [
          {time: "2031-01-01 09:39:00", ftime:"2031-01-01 09:45:00",context:"angekommen MH Heißen",location:""},
          {time: "2031-01-01 09:39:00", ftime:"2031-01-01 09:45:00",context:"angekommen MH Heißen",location:""},
          {time: "2031-01-01 09:39:00", ftime:"2031-01-01 09:45:00",context:"angekommen MH Heißen",location:""},
          {time: "2031-01-01 09:39:00", ftime:"2031-01-01 09:45:00",context:"angekommen MH Heißen",location:""},
          {time: "2031-01-01 09:39:00", ftime:"2031-01-01 09:45:00",context:"angekommen MH Heißen",location:""},
        ],
                activities: [{
                  content: '支持使用图标',
                  timestamp: '2018-04-12 20:46',
                  size: 'large',
                  type: 'primary',
                  icon: 'el-icon-more'
                }, {
                  content: '支持自定义颜色',
                  timestamp: '2018-04-03 20:46',
                  color: '#0bbd87'
                }, {
                  content: '支持自定义尺寸',
                  timestamp: '2018-04-03 20:46',
                  size: 'large'
                }, {
                  content: '默认样式的节点',
                  timestamp: '2018-04-03 20:46'
                }]

      }
    },
    created() {
      // this.getStatus()
      this.getDataList()
    },


    computed: {
      delivery_detail_address() {
        let a = this.delivery_address
        return a.consignee + ' ' + a.street + ' ' + a.house_number + ' ' + a.postcode + ' ' + a.city + ' ' + a.country
      },

      bill_detail_address() {
        let a = this.bill_address
        return a.consignee + ' ' + a.street + ' ' + a.house_number + ' ' + a.postcode + ' ' + a.city + ' ' + a.country
      },

      address_title() {
        if (this.addressType == 'd') {
          return '选择收货地址'
        }
        return '选择账单地址'
      }


    },

    methods: {

      getStatus() {
        this.queryInfo.status = this.status
      },

      async getDataList() {
        const {
          data: res
        } = await this.$http.get('apiOrder', {
          params: this.queryInfo
        })
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

      showInvoice(url) {
        console.log(url)
        window.open(url) //打开一个新的标签页
      },

      cancelOrder(order_id) {
        const {data: res} =  this.$http.post('apiCancelOrder', {id: order_id})
        if (res.code !== 200) {
          return this.$message.error(res.msg)
        }
        this.getDataList()
        this.$message.success('订单已取消！')
      },

      async showDetailDialog(id) {
        const {
          data: res
        } = await this.$http.get('apiOrderDetail/', {
          params: {
            id: id
          }
        })
        if (res.code !== 200) {
          return this.$message.error(res.msg)
        }
        this.detail = res.data
        this.bill_address = this.detail.baddress
        this.delivery_address = this.detail.daddress
        this.detailDialogVisible = true
      },

      async showEditDialog(id) {
        const {
          data: res
        } = await this.$http.get('apiOrder/' + id)
        if (res.code !== 200) {
          return this.$message.error(res.msg)
        }
        this.editForm = res.data
        this.bill_address = this.editForm.baddress
        this.delivery_address = this.editForm.daddress
        this.editDialogVisible = true
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      toPay() {
        this.editForm.status_text = "已付款"
        this.editForm.status = 20
      },

      edit() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          let data = {
            status: this.editForm.status,
            default_delivery_address: this.delivery_address.id,
            default_bill_address: this.bill_address.id
          }
          const {
            data: res
          } = await this.$http.put('apiOrder/' + this.editForm.id, data)
          if (res.code !== 200) {
            return this.$message.error(res.msg)
          }
          this.editDialogVisible = false
          this.getDataList()
          this.$message.success('更新数据成功！')
        })
      },

      selectDelivery() {
        this.addressType = 'd'
        this.showAddressDialog()
      },
      selectBill() {
        this.addressType = 'b'
        this.showAddressDialog()
      },
      async showAddressDialog() {
        const {
          data: res
        } = await this.$http.get('apiAddressList/', {
          params: {
            api_user_id: this.editForm.user_id
          }
        })
        if (res.code !== 200) {
          return this.$message.error("获取地址列表失败")
        }
        this.addressList = res.data
        this.addressDialogVisible = true
      },
      selectAddress(row) {
        if (this.addressType == 'd') {
          this.delivery_address = row
        } else {
          this.bill_address = row
        }
        this.addressDialogVisible = false
      }

    }
  }
</script>

<style lang="less" scoped>
</style>
