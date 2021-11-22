export default {
	state:{
    queryInfo: { sort: 0, limit: 5},
    asc_list:[],
    desc_list:[],
	},
  getters:{

  },
	mutations:{

      initQueryInfo(state,sort){
        state.queryInfo.sort = sort
      },

      ascListMutation(state, data){
          state.asc_list = data
      },

      dscListMutation(state, data){
        state.desc_list = data
      },

	},

  actions:{
    getAscListAction({state,commit}){
      console.log("*******************************")
      
      
    //  const { data: res} =  $http.get('testapi', { params: state.queryInfo })

    },

    getDescListAction(){

    }

  }


}
