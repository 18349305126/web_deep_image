<template>
  <div>
    <div>
      {{ this.vers[0] }}
      {{this.normals[0]}}
    </div>
    <div id="container"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import Vue from "vue";
import { CSS2DRenderer, CSS2DObject } from "three-css2drender";
import { BufferGeometry, Material, MeshBasicMaterial } from "three";
import axios from "axios";
// import * as cornerstone from "cornerstone-core";
// import * as dicomParser from "dicom-parser";
 
// // 不建议 npm 安装 cornerstoneWADOImageLoader 如果你做了 会很头疼 
// import * as cornerstoneWADOImageLoader from "../../static/dist/cornerstoneWADOImageLoader.js";
 
//指定要注册加载程序的基石实例
// cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
// import VueAxios from 'vue-axios';
// require("three/examples/js/loaders/VTKLoader");

const OrbitControls = require("three-orbit-controls")(THREE);

Vue.prototype.$Three = THREE;

export default {
  name: "ThreeView",
  data() {
    return {
      scene: "",
      labelRenderer: "",
      light: "",
      camera: "",
      controls: "",
      renderer: "",
      geometry: "",
      material: "",
      cube: "",
      fov: 60,
      biaozhudiv: "",
      img: "",
      biaozhuLabel: "",
      vers: "",
      normals: "",
    };
  },
  mounted() {
    // window.vue = this;
    this.init();
    this.addObj();
    this.animate();
    // this.addObj();
    // this.animate();
  },
  updated() {
    // console.log("vers", this.vers);
    this.addObj();
    this.render();
  },

  methods: {
    init() {
      this.scene = new THREE.Scene();
      this.scene.add(new THREE.AmbientLight(0xdddddd,0.2)); //环境光
      // this.light = new THREE.DirectionalLight(0xff0000, 1); //
      this.light = new THREE.PointLight(0xeeeeee, 1, 0);
      this.light.position.set(200, 200, 200);
      // this.light.position.multiplyScalar(0.3);
      this.light.position.multiplyScalar(1);
      this.scene.add(this.light);

      var ligthSphereGeo = new THREE.SphereBufferGeometry(5, 5, 5);
      var lightMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
      var ligthMesh = new THREE.Mesh(ligthSphereGeo, lightMaterial);
      ligthMesh.position.set(200, 200, 200);
      // this.scene.add(ligthMesh);
      // var testSphereGeo = new THREE.BoxBufferGeometry(10,10,10);
      // var testMaterial = new THREE.MeshLambertMaterial({color: 0xff0000,wireframe: false});
      // var testMesh = new THREE.Mesh(testSphereGeo,testMaterial);
      // testMesh.position.set(10, 10, 10);
      // this.scene.add(testMesh);

      //初始化相机
      this.camera = new THREE.PerspectiveCamera(
        this.fov,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      this.camera.position.set(10, 90, 65);
      this.camera.lookAt(this.scene.position);
      //初始化控制器
      this.controls = new OrbitControls(this.camera);
      this.controls.target.set(0, 0, 0);
      this.controls.minDistance = 80;
      this.controls.maxDistance = 400;
      this.controls.maxPolarAngle = Math.PI / 3;
      this.controls.update();
      //渲染
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
      }); //会在body里面生成一个canvas标签,
      this.renderer.setPixelRatio(window.devicePixelRatio); //为了兼容高清屏幕
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setClearColor(0x000000,1.0);


      const container = document.getElementById("container");
      container.appendChild(this.renderer.domElement);
      //标注渲染
      this.labelRenderer = new CSS2DRenderer();
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
      this.labelRenderer.domElement.style.position = "absolute";
      this.labelRenderer.domElement.style.top = 0;
      container.appendChild(this.labelRenderer.domElement);
      window.addEventListener("resize", this.onWindowResize, false); //添加窗口监听事件（resize-onresize即窗口或框架被重新调整大小）
      this.read_data("../../static/model/test/json_test.json","../../static/model/test/normal_test.json");
    },
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.render();
    },
    render() {
      this.renderer.render(this.scene, this.camera);
      this.labelRenderer.render(this.scene, this.camera);
    },
    // addObj() {
    //   var sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    //   var sphereMaterial = new THREE.MeshLambertMaterial({
    //     color: 0x7777ff,
    //     wireframe: false,
    //   });
    //   var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //   this.scene.add(sphere);
    // },
    read_data(data_url,normal_yrl) {
      axios.get(data_url).then((response) => {
        // console.log("rep",response.data);
        this.vers = new Float32Array(response.data);
      });
      axios.get(normal_yrl).then((response) => {
        // console.log("rep",response.data);
        this.normals = new Float32Array(response.data);
      });
    },
    addObj() {
      // this.read_data("../../static/model/test/json_test.json");
      // this.read_data("../../static/model/test/json_test.json");

      this.geometry = new THREE.BufferGeometry();

      // console.log(this.vers);
      // 创建一个简单的矩形. 在这里我们左上和右下顶点被复制了两次。
      // 因为在两个三角面片里，这两个顶点都需要被用到。
      // var vertices = new Float32Array( [
      //   -1.0, -1.0,  1.0,
      //   1.0, -1.0,  1.0,
      //   1.0,  1.0,  1.0,

      //   1.0,  1.0,  1.0,
      //   -1.0,  1.0,  1.0,
      //   -1.0, -1.0,  1.0
      // ] );
      // console.log("vers", this.vers);

      // itemSize = 3 因为每个顶点都是一个三元组。
      this.geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(this.vers, 3)
      );
      // this.normals = [];
      // for (let i = 0; i < this.vers.length / 9; i++) {
      //   var p1 = new THREE.Vector3(this.vers[i],this.vers[i+1],this.vers[i+2]);
      //   var p2 = new THREE.Vector3(this.vers[i+3],this.vers[i+4],this.vers[i+5]);
      //   var p3 = new THREE.Vector3(this.vers[i+6],this.vers[i+7],this.vers[i+8]);
      //   var normal = this.getNormal(p1,p2,p3);
      //   var nx = this.normals.x;
      //   var ny = this.normals.y;
      //   var nz = this.normals.z;

      //   this.normals.push(nx,ny,nz);
      //   this.normals.push(nx,ny,nz);
      //   this.normals.push(nx,ny,nz);
      // }

      this.geometry.addAttribute(
        "normal",
        new THREE.Float32BufferAttribute(this.normals, 3)
      );
      // console.log(this.normals);

      this.material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: false,
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.geometry.verticesNeedUpdate = true;
      this.scene.add(this.mesh);
    },
    // getNormal(point1, point2, point3) {
    //   var d12 = point1.clone().sub(point2);
    //   var d13 = point1.clone().sub(point3);
    //   var normal = d12.clone().cross(d13).normalize();
    //   return normal;

    // },
    // sleep(numberMillis) {
    //   var now = new Date();
    //   var exitTime = now.getTime() + numberMillis;
    //   while (true) {
    //     now = new Date();
    //     if (now.getTime() > exitTime) return;
    //   }
    // },
  },
};
</script>


