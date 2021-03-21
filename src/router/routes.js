// import DicomController from '@/components/dicom/DicomController'
  

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/LayoutDefault'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/pages/Dashboard')
      },
      {
        path: 'about',
        component: () => import('@/pages/About.vue')
      },
      {
        path: 'dicom',
        // components:DicomController
        component:() => import('@/components/dicom/DicomController')
      },
      {
        path:"three",
        component:() => import('@/components/ThreeView')
      }
      // {
      //   path:'dicom_t',
      //   component:() => import('@/components/dicom/dicomhandle/CornerstoneTest2')
      // }
      // {
      //   path:"uploader_test",
      //   component:() =>import('@/components/dicom/test/UploaderTest')
      // }
      
    ]
  }
]

export default routes
