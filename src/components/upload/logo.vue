<template>
      <div>
           <el-upload ref='my-upload' :action="uploadURL"  :on-preview="imgPreview" :limit="limitImg"
               :on-remove="imgRemove" list-type="picture-card" :headers="headerObj" :show-file-list="true"
               :on-success="imgUpload"  :auto-upload="false" :file-list="fileList">
             <el-button size="small" type="primary">{{uploadBtnLabel}}</el-button>
           </el-upload>

          <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%">
              <img :src="previewPath" alt="" class="previewImg">
          </el-dialog>
      </div>
</template>

<script>
  export default {
    data() {
      return {
        wls_img:'',
        limitImg:1,
        removeImgID:[],
        removeImgTemp:'',
        uploadURL: 'http://devmatch.wlsphoenix.de/apiUpload',
        headerObj: { Authorization: window.sessionStorage.getItem('token')},
        previewPath: '',
        previewVisible: false,

      };
    },
    props:{
        fileList:Array
      },

    computed:{

      uploadBtnLabel() {
        if(this.fileList){
          return this.fileList.length == 0?"点击上传":"改变图片"
        }
        return "点击上传"
      },
    },

    methods: {
       submit () {
            this.$refs['my-upload'].submit();
        },

       imgUpload(res) {
         if (res.code !== 200) { return this.$message.error('图片上传失败！')}
           this.wls_img =res.data
           this.$emit('updateImgUrl',this.wls_img)
         },

       imgPreview(file) {
         this.previewPath =  file.url
         this.previewVisible = true
       },

      imgRemove(res) {
        if(res.response && res.response.data){
          this.removeImgTemp = res.response.data
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
