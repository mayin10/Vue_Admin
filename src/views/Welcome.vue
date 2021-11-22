<template>
  <div>
    <h3>Welcome</h3>
    <h3>{{httpUrl}}</h3>
  </div>
</template>

<script>
  export default{
    data(){
      return{
        httpUrl: this.httpUrl
      }
    }
  }
</script>
