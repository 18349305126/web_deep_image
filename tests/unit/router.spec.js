import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import routes from '@/router/routes.js'
import Element from 'element-ui'
import LayoutDefault from '@/layouts/LayoutDefault.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)
localVue.use(Element, { size: 'small' })

describe('LayoutDefault.vue', () => {
  it('renders a child component via routing', async () => {
    const router = new VueRouter({ routes })
    const wrapper = shallowMount(LayoutDefault, {
      localVue,
      router
    })
    router.push('/about')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.$route.path).toBe('/about')
    console.log(router.currentRoute)
  })
})
