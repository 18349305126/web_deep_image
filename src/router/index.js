import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
// import cont1 from '@/components/content1'
// import FlowPanel from '../components/ef/panel'
import routes from './routes'



Vue.use(Router)

// export default new Router({
//   routes: [
//     {
//       path: '/',
//       name: 'HelloWorld',
//       component: HelloWorld
//     }
//   ]
// })
export default new Router({
  routes:routes
    
})
