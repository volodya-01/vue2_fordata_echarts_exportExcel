<template>
  <div class="hello">
    <Echarts/>
  </div>
</template>

<script>
import Echarts from './Echarts/index'
export default {
  name: "HelloWorld",
  components:{
    Echarts
  },
  data() {
    return {
      msg: "Welcome to Your Vue.js App"
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.hello {
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100vw;
  height: 100vh;
}
</style>
