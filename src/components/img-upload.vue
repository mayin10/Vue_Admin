<template>
      <div>
             <el-upload ref='my-upload' :action="uploadURL"  :on-preview="imgPreview" :limit="limitImg"
               :on-remove="imgRemove" list-type="picture-card" :headers="headerObj" :show-file-list="true"
               :on-success="imgUpload"  :auto-upload="true" :file-list="fileList">
               <el-button size="small" type="primary" @click="clearFiles">{{uploadBtnLabel}}</el-button>
              </el-upload>

            <el-dialog title="图片预览" :visible.sync="previewVisible" width="80%">
              <img :src="previewPath" alt="" class="previewImg">
            </el-dialog>
      </div>
</template>

<script>
  export default {
    data() {
      return {
        wls_img:'',
        wls_img_list:[],
        removeImgID:[],
        removeImgTemp:'',
        uploadURL: this.httpUrl+'apiUpload',
        headerObj: { Authorization: window.sessionStorage.getItem('token')},
        previewPath: '',
        previewVisible: false,

      };
    },
    props:{
        fileList:Array,
        type:String,
      },

    computed:{
      limitImg(){
        if(this.type == 'logo' || this.type == 'cover'){
           return 1
        } else if(this.type == 'lunbo'){
           return 4
        } else if(this.type == 'detail'){
          return 10
        }
       return 10
      },
      uploadBtnLabel() {
        if(this.fileList){
          return this.fileList.length == 0?"点击上传":"改变图片"
        }
        return "点击上传"
      },
    },

    methods: {
       clearFiles () {
         if(this.type == 'logo' || this.type == 'cover'){
            this.$refs['my-upload'].clearFiles();
         }
        },
       submit () {
            this.$refs['my-upload'].submit();
        },

       imgUpload(res) {
         if (res.code !== 200) { return this.$message.error('图片上传失败！')}
         if(this.type == 'logo' || this.type == 'cover'){
            this.wls_img = res.data;
         } else{
            this.wls_img_list.push(res.data)
         }
         this.$emit('updateImgUrl',this.wls_img, this.wls_img_list, this.type)
         },


       imgPreview(file) {
         this.previewPath =  file.url
         this.previewVisible = true
       },

      imgRemove(res) {
        if(res.response && res.response.data){
          this.removeImgTemp = res.response.data
          let i = this.wls_img_list.findIndex(item => item === res.response.data)
          this.wls_img_list.splice(i, 1)
        }
        if(res.id >0){
           this.removeImgID.push(res.id)
         }
           this.$emit('imgRemove', this.removeImgID, this.removeImgTemp)
        },
    }
  }
</script>

<style lang="less" scoped>
 </style>
