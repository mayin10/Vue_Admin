import Vue from "vue"
import Vuex from "vuex"


import burger from "@/store/modules/burger.js"

Vue.use(Vuex)

export default new Vuex.Store({
	modules:{
    burger
	}
})
