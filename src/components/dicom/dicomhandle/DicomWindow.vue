<template>
  <div>
    <!-- <div
      id="dicomImage"
      v-bind:style="getStyle()"
    ></div> -->

    <div ref="dicomImage"></div>
    <!-- <input id="test" type ="button" style="position: absolute;"/> -->
  </div>
</template>

<script>
//引入 cornerstone,dicomParser,cornerstoneWADOImageLoader
import * as cornerstone from "cornerstone-core";
import * as dicomParser from "dicom-parser";
import * as tf from "@tensorflow/tfjs";
import * as THREE from "three";

// 不建议 npm 安装 cornerstoneWADOImageLoader 如果你做了 会很头疼
import * as cornerstoneWADOImageLoader from "../../../../static/dist/cornerstoneWADOImageLoader.js";

// Cornerstone 工具外部依赖
import Hammer from "hammerjs";
import * as cornerstoneMath from "cornerstone-math";
import * as cornerstoneTools from "cornerstone-tools";
var c = require("../../../../static/opencvjs/opencv_js.js");

// Specify external dependencies
cornerstoneTools.external.Hammer = Hammer;
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneWADOImageLoader.external.cornerstoneMath = cornerstoneMath;

//指定要注册加载程序的基石实例
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;

cornerstone.registerImageLoader("http", cornerstoneWADOImageLoader.loadImage);
cornerstone.registerImageLoader("https", cornerstoneWADOImageLoader.loadImage);

//配置 webWorker (必须配置)
//注意这里的路径问题  如果路径不对 cornerstoneWADOImageLoaderWebWorker 会报错 index.html Uncaught SyntaxError: Unexpected token <
var config = {
  webWorkerPath: "/static/dist/cornerstoneWADOImageLoaderWebWorker.js",
  taskConfiguration: {
    decodeTask: {
      codecsPath: "/static/dist/cornerstoneWADOImageLoaderCodecs.js",
    },
  },
};
if (!cornerstoneWADOImageLoader.webWorkerManager.config)
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

export default {
  name: "DicomWindow",
  props: [
    "mat",
    "width",
    "height",
    "mat_width",
    "mat_height",
    "mat_row_spacing",
    "mat_col_spacing",
    "label",
  ],
  //其中mat是dicomController传过来的切片矩阵，
  //width,heigth是针对dom元素的长宽
  //mat_width，mat_height是mat的宽度高度
  //mat_row_spacing,mat_col_spacing是原dicom文件中像素距离，可以看作渲染时的缩放倍数
  data() {
    return {
      container: "",
      alpha:Number,
      view: {
        scene: "",
        renderer: "",
        camera: "",
        geometry: "",
        mesh: "",
      }, //与渲染相关的变量都在这里

      // file: "",
      // img:"",
      // test_data:"",
    };
  },
  methods: {
    initRender() {
      this.view.scene = new THREE.Scene();
      this.view.camera = new THREE.PerspectiveCamera(
        75,
        this.width / this.height,
        0.1,
        1000
      );
      this.view.renderer = new THREE.WebGLRenderer();
      this.view.renderer.setSize(this.width, this.height);

      this.container = this.$refs.dicomImage;
      // const container = document.getElementById("dicomImage");
      this.container.appendChild(this.view.renderer.domElement);
      this.container.addEventListener("mousewheel", this.mousewheel, false);
      this.container.addEventListener("mousedown", this.mousedown, false);

      this.view.camera.position.z = 500;
      this.view.camera.lookAt(new THREE.Vector3(0, 0, 0));

      this.view.geometry = new THREE.BufferGeometry();
      // this.view.geometry.center();
      let material = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors,
      }); //这里渲染方式应该是简单插值，但效果感觉不是很好
      this.view.mesh = new THREE.Mesh(this.view.geometry, material);

      this.view.mesh.scale.set(this.mat_row_spacing, this.mat_col_spacing);
      if (this.label == "z") this.view.mesh.rotateZ(-Math.PI / 2);
      // console.log(this.view.geometry);
      this.view.scene.add(this.view.mesh);

      this.render();
    },
    render() {
      requestAnimationFrame(this.render);
      this.view.renderer.render(this.view.scene, this.view.camera);
    },

    mousewheel(e) {
      e.preventDefault();
      //e.stopPropagation();
      if (e.wheelDelta) {
        //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) {
          //当滑轮向上滚动时
          if (this.view.camera.position.z > 0)
            this.view.camera.position.z -= 50;
          // fov -= near < fov ? 1 : 0;
        }
        if (e.wheelDelta < 0) {
          //当滑轮向下滚动时
          this.view.camera.position.z += 50;
          // fov += fov < far ? 1 : 0;
        }
      } else if (e.detail) {
        //Firefox滑轮事件
        if (e.detail > 0) {
          //当滑轮向上滚动时
          if (this.view.camera.position.z > 0)
            this.view.camera.position.z -= 50;
          // fov -= 1;
        }
        if (e.detail < 0) {
          //当滑轮向下滚动时
          this.view.camera.position.z += 50;
          // fov += 1;
        }
      }
      // this.view.camera.fov = fov;
      this.view.camera.updateProjectionMatrix();
      this.view.renderer.render(this.view.scene, this.view.camera);
      //updateinfo();
    },
    mousedown(e) {
      const _this = this;
      // console.log(this.label,"鼠标已按下");
      let disX = e.clientX;
      let disY = e.clientY;
      let o_poistion_x = this.view.camera.position.x;
      let o_poistion_y = this.view.camera.position.y;

      this.container.onmousemove = function (e) {
        //计算需要移动的距离
        let dx = e.clientX - disX;
        let dy = e.clientY - disY;
        // console.log(dx,dy);
        _this.view.camera.position.x = o_poistion_x + dx;
        _this.view.camera.position.y = o_poistion_y + dy;

        //移动当前元素
        // if (t >= 0 && t <= window.innerWidth - el.offsetWidth) {
        //   el.style.left = t + "px";
        // }
      };
      // this.container.onmousemove = this.mousemove(disX,disY,o_poistion_x,o_poistion_y);
      this.container.onmouseup = function (e) {
        _this.container.onmousemove = null;
        _this.container.onmouseup = null;
      };
      console.log(this.container.onmousemove);
    },
    // mousemove(e, disX, disY,o_poistion_x,o_poistion_y) {
    //   let dx = e.clientX - disX;
    //   let dy = e.clientY - disY;
    //   // console.log(dx,dy);
    //   this.view.camera.position.x = o_poistion_x + dx;
    //   this.view.camera.position.y = o_poistion_y + dy;
    // },

    imgAdd(mat,alp) {
      // //以三角形面片为单位！！！！
      let row = this.mat_width;
      let col = this.mat_height;

      let k = 0;
      let vertices = new Float32Array((row - 1) * (col - 1) * 6 * 3);
      let ncolors = new Float32Array((row - 1) * (col - 1) * 6 * 3);

      let abnorm = 0;
      for (let i = 0; i < row - 1; i++) {
        for (let j = 0; j < col - 1; j++) {
          //每一个循环针对一个正方形方格，每一个正方形方格中有两个三角形面片，这个顺序很重要，不能改（我也不知道原理）
          // let p0 = [i,j,0];
          // let p1 = [i,j+1,0];
          // let p2 = [i+1,j,0];
          // let p3 = [i+1,j+1,0];

          //第一个三角形
          //第一个点
          vertices[k] = i;
          vertices[k + 1] = j;
          vertices[k + 2] = 0;
          ncolors[k] = mat[i][j] / 1024 * alp;
          ncolors[k + 1] = mat[i][j] / 1024 * alp;
          ncolors[k + 2] = mat[i][j] / 1024 * alp;

          //第二个点
          vertices[k + 3] = i + 1;
          vertices[k + 4] = j;
          vertices[k + 5] = 0;
          ncolors[k + 3] = mat[i + 1][j] / 1024 * alp;
          ncolors[k + 4] = mat[i + 1][j] / 1024 * alp;
          ncolors[k + 5] = mat[i + 1][j] / 1024 * alp;

          //第三个点
          vertices[k + 6] = i;
          vertices[k + 7] = j + 1;
          vertices[k + 8] = 0;
          ncolors[k + 6] = mat[i][j + 1] / 1024 * alp;
          ncolors[k + 7] = mat[i][j + 1] / 1024 * alp;
          ncolors[k + 8] = mat[i][j + 1] / 1024 * alp;

          //第二个三角形
          //第一个点
          vertices[k + 9] = i + 1;
          vertices[k + 10] = j + 1;
          vertices[k + 11] = 0;
          ncolors[k + 9] = mat[i + 1][j + 1] / 1024 * alp;
          ncolors[k + 10] = mat[i + 1][j + 1] / 1024 * alp;
          ncolors[k + 11] = mat[i + 1][j + 1] / 1024 * alp;

          //第二个点
          vertices[k + 12] = i;
          vertices[k + 13] = j + 1;
          vertices[k + 14] = 0;
          ncolors[k + 12] = mat[i][j + 1] / 1024 * alp;
          ncolors[k + 13] = mat[i][j + 1] / 1024 * alp;
          ncolors[k + 14] = mat[i][j + 1] / 1024 * alp;

          //第三个点
          vertices[k + 15] = i + 1;
          vertices[k + 16] = j;
          vertices[k + 17] = 0;
          ncolors[k + 15] = mat[i + 1][j] / 1024 * alp;
          ncolors[k + 16] = mat[i + 1][j] / 1024 * alp;
          ncolors[k + 17] = mat[i + 1][j] / 1024 * alp;

          if(mat[i][j] >= 255 && this.label =="z" )abnorm+=1;

          // for (let ind = 0; ind < 18; ind++) {
          //   ncolors[k+ind]=0.5;

          // }
          k += 18;
        }
      }
      // console.log(abnorm);

      // this.view.geometry = new THREE.BufferGeometry();
      this.view.geometry.addAttribute(
        "position",
        new THREE.BufferAttribute(vertices, 3)
      );
      this.view.geometry.addAttribute(
        "color",
        new THREE.BufferAttribute(ncolors, 3)
      );
      this.view.geometry.center();
      // let material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});//这里渲染方式应该是简单插值，但效果感觉不是很好
      // this.view.mesh = new THREE.Mesh(this.view.geometry,material);

      // this.view.mesh.scale.set(this.mat_row_spacing,this.mat_col_spacing);
      // if(this.label=="z")this.view.mesh.rotateZ(-Math.PI/2);
      // // console.log(this.view.geometry);
      // this.view.scene.add(this.view.mesh);

      //       正方形渲染的顺序，一定不能乱
      // //       var vertices = new Float32Array( [
      // // 	 0.0,  0.0,  1.0,
      // // 	 1.0,  0.0,  1.0,
      // // 	 0.0,  1.0,  1.0,

      // // 	 1.0,  1.0,  1.0,
      // // 	 0.0,  1.0,  1.0,
      // // 	 1.0,  0.0,  1.0
      // // ] );

      // this.render();
    },
    // handleDragOver(evt) {
    //   evt.stopPropagation();
    //   evt.preventDefault();
    //   evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    // },

    // showView(image) {
    //   if (image != undefined) {
    //     // console.log("image",image);
    //     var element = document.getElementById("dicomImage");
    //     var viewport = cornerstone.getDefaultViewportForImage(element, image);
    //     // viewport.displayedArea.brhc.x=256;
    //     // viewport.displayedArea.brhc.y=256;
    //     // viewport.scale=0.5;
    //     // console.log(viewport);

    //     cornerstone.displayImage(element, image, viewport);
    //   }
    // },

    getStyle() {
      let style = this.StringFormat(
        "width: {0}px;height: {1}px;top: 0px;left: 0px;position: absolute;",
        this.width,
        this.height
      );

      // console.log(style);
      return style;
    },
  },
  created(){
    this.alpha = 0.5;
  },
  mounted() {
    let element = document.getElementById("dicomImage");
    this.initRender();
    // cornerstone.enable(element);
  },
  watch: {
    mat(new_m, old_m) {
      if (new_m != undefined) {
        // if(this.label == "x"){
        //   console.log(new_m);
        // }
        // console.log(this.label,new_m);

        this.imgAdd(new_m,this.alpha);
      }
    },
  },
};
</script>